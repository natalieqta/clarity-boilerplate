"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import type {
  AssessmentStatus,
  AssessmentResult,
  AssessmentError,
  WordScore,
} from "./types";

// Module-level token cache shared across all hook instances
let cachedToken: { token: string; region: string; expiresAt: number } | null =
  null;

async function fetchToken(): Promise<{ token: string; region: string }> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return { token: cachedToken.token, region: cachedToken.region };
  }

  const res = await fetch("/api/speech-token");
  if (!res.ok) throw new Error("Token fetch failed");

  const data = await res.json();
  cachedToken = {
    token: data.token,
    region: data.region,
    expiresAt: Date.now() + 9 * 60 * 1000, // refresh at 9 min
  };
  return { token: data.token, region: data.region };
}

export function useAzureSpeech(options: {
  referenceText: string;
  enabled?: boolean;
}) {
  const { referenceText, enabled = true } = options;
  const [status, setStatus] = useState<AssessmentStatus>("idle");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<AssessmentError | null>(null);

  const recognizerRef = useRef<unknown>(null);
  const disposedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const busyRef = useRef(false);

  const safeClose = useCallback(() => {
    if (recognizerRef.current && !disposedRef.current) {
      disposedRef.current = true;
      try {
        (recognizerRef.current as { close: () => void }).close();
      } catch {
        // already disposed — ignore
      }
    }
    recognizerRef.current = null;
  }, []);

  const cleanup = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    safeClose();
  }, [safeClose]);

  useEffect(() => cleanup, [cleanup]);

  const startRecording = useCallback(async () => {
    if (!enabled || busyRef.current) return;
    busyRef.current = true;

    setError(null);
    setResult(null);
    setStatus("requesting-mic");

    // Check microphone availability
    if (!navigator.mediaDevices?.getUserMedia) {
      setError({
        code: "mic-unavailable",
        message: "Microphone not available. Make sure you're using HTTPS.",
      });
      setStatus("error");
      busyRef.current = false;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setError({
        code: "mic-denied",
        message:
          "Microphone access denied. Allow mic access in your browser settings.",
      });
      setStatus("error");
      busyRef.current = false;
      return;
    }

    // Fetch token
    let token: string;
    let region: string;
    try {
      const t = await fetchToken();
      token = t.token;
      region = t.region;
    } catch {
      setError({
        code: "token-failed",
        message: "Could not connect to speech service. Try again.",
      });
      setStatus("error");
      busyRef.current = false;
      return;
    }

    setStatus("recording");

    try {
      const sdk = await import("microsoft-cognitiveservices-speech-sdk");

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
        token,
        region
      );
      speechConfig.speechRecognitionLanguage = "en-US";

      const pronunciationConfig = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        true
      );
      pronunciationConfig.enableProsodyAssessment = true;

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      pronunciationConfig.applyTo(recognizer);
      recognizerRef.current = recognizer;
      disposedRef.current = false;

      // 25-second safety timeout
      timeoutRef.current = setTimeout(() => {
        safeClose();
        setError({
          code: "timeout",
          message: "Recording too long. Keep it under 25 seconds.",
        });
        setStatus("error");
        busyRef.current = false;
      }, 25000);

      recognizer.recognizeOnceAsync(
        (speechResult) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }

          setStatus("processing");

          try {
            const jsonStr = speechResult.properties.getProperty(
              sdk.PropertyId.SpeechServiceResponse_JsonResult
            );

            if (!jsonStr) {
              setError({
                code: "recognition-failed",
                message: "No speech detected. Try speaking louder.",
              });
              setStatus("error");
              busyRef.current = false;
              safeClose();
              return;
            }

            const json = JSON.parse(jsonStr);
            const nBest = json.NBest?.[0];

            if (!nBest?.PronunciationAssessment) {
              setError({
                code: "recognition-failed",
                message: "Could not assess pronunciation. Try again.",
              });
              setStatus("error");
              busyRef.current = false;
              safeClose();
              return;
            }

            const pa = nBest.PronunciationAssessment;
            const words: WordScore[] = (nBest.Words || []).map(
              (w: {
                Word: string;
                PronunciationAssessment?: {
                  AccuracyScore: number;
                  ErrorType: string;
                };
              }) => ({
                word: w.Word,
                accuracyScore:
                  w.PronunciationAssessment?.AccuracyScore ?? 0,
                errorType:
                  (w.PronunciationAssessment?.ErrorType as WordScore["errorType"]) ??
                  "None",
              })
            );

            const assessmentResult: AssessmentResult = {
              scores: {
                accuracyScore: pa.AccuracyScore ?? 0,
                fluencyScore: pa.FluencyScore ?? 0,
                completenessScore: pa.CompletenessScore ?? 0,
                prosodyScore: pa.ProsodyScore ?? 0,
                overallScore: pa.PronScore ?? 0,
              },
              words,
              recognizedText: nBest.Display || speechResult.text || "",
              referenceText,
              timestamp: Date.now(),
            };

            setResult(assessmentResult);
            setStatus("done");
            busyRef.current = false;
          } catch {
            setError({
              code: "recognition-failed",
              message: "Error processing results. Try again.",
            });
            setStatus("error");
            busyRef.current = false;
          }

          safeClose();
        },
        (err) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setError({
            code: "recognition-failed",
            message: typeof err === "string" ? err : "Recognition failed.",
          });
          setStatus("error");
          busyRef.current = false;
          safeClose();
        }
      );
    } catch {
      setError({
        code: "recognition-failed",
        message: "Failed to start recording. Try again.",
      });
      setStatus("error");
      busyRef.current = false;
    }
  }, [enabled, referenceText, safeClose]);

  const stopRecording = useCallback(() => {
    cleanup();
    busyRef.current = false;
    if (status === "recording") {
      setStatus("idle");
    }
  }, [cleanup, status]);

  const reset = useCallback(() => {
    cleanup();
    busyRef.current = false;
    setStatus("idle");
    setResult(null);
    setError(null);
  }, [cleanup]);

  return { status, result, error, startRecording, stopRecording, reset };
}
