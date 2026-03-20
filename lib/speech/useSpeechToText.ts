"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Token cache (shared pattern with useAzureSpeech)
let cachedToken: { token: string; region: string; expiresAt: number } | null = null;

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
    expiresAt: Date.now() + 9 * 60 * 1000,
  };
  return { token: data.token, region: data.region };
}

export type SttStatus = "idle" | "requesting-mic" | "recording" | "stopping" | "done" | "error";

export interface SttError {
  code: "mic-denied" | "mic-unavailable" | "token-failed" | "recognition-failed";
  message: string;
}

export function useSpeechToText() {
  const [status, setStatus] = useState<SttStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimText, setInterimText] = useState("");
  const [error, setError] = useState<SttError | null>(null);

  const recognizerRef = useRef<unknown>(null);
  const partsRef = useRef<string[]>([]);
  const busyRef = useRef(false);

  const cleanup = useCallback(() => {
    if (recognizerRef.current) {
      try {
        const r = recognizerRef.current as {
          stopContinuousRecognitionAsync?: (cb?: () => void) => void;
          close: () => void;
        };
        r.close();
      } catch {
        // ignore
      }
      recognizerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startRecording = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    setError(null);
    setTranscript("");
    setInterimText("");
    partsRef.current = [];
    setStatus("requesting-mic");

    // Check mic
    if (!navigator.mediaDevices?.getUserMedia) {
      setError({ code: "mic-unavailable", message: "Microphone not available." });
      setStatus("error");
      busyRef.current = false;
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setError({ code: "mic-denied", message: "Microphone access denied." });
      setStatus("error");
      busyRef.current = false;
      return;
    }

    // Token
    let token: string;
    let region: string;
    try {
      const t = await fetchToken();
      token = t.token;
      region = t.region;
    } catch {
      setError({ code: "token-failed", message: "Could not connect to speech service." });
      setStatus("error");
      busyRef.current = false;
      return;
    }

    try {
      const sdk = await import("microsoft-cognitiveservices-speech-sdk");

      const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
      speechConfig.speechRecognitionLanguage = "en-US";

      const audioConfig = sdk.AudioConfig.fromDefaultMicrophoneInput();
      const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfig);
      recognizerRef.current = recognizer;

      // Accumulate final recognized phrases
      recognizer.recognized = (_sender, event) => {
        if (
          event.result.reason === sdk.ResultReason.RecognizedSpeech &&
          event.result.text
        ) {
          partsRef.current.push(event.result.text);
          setTranscript(partsRef.current.join(" "));
          setInterimText("");
        }
      };

      // Show interim text
      recognizer.recognizing = (_sender, event) => {
        if (event.result.text) {
          setInterimText(event.result.text);
        }
      };

      recognizer.canceled = (_sender, event) => {
        if (event.reason === sdk.CancellationReason.Error) {
          setError({ code: "recognition-failed", message: event.errorDetails || "Recognition error." });
          setStatus("error");
          busyRef.current = false;
          cleanup();
        }
      };

      recognizer.startContinuousRecognitionAsync(
        () => {
          setStatus("recording");
        },
        (err) => {
          setError({
            code: "recognition-failed",
            message: typeof err === "string" ? err : "Failed to start recording.",
          });
          setStatus("error");
          busyRef.current = false;
          cleanup();
        }
      );
    } catch {
      setError({ code: "recognition-failed", message: "Failed to initialize speech service." });
      setStatus("error");
      busyRef.current = false;
    }
  }, [cleanup]);

  const stopRecording = useCallback(() => {
    if (!recognizerRef.current || status !== "recording") return;

    setStatus("stopping");
    setInterimText("");

    const recognizer = recognizerRef.current as {
      stopContinuousRecognitionAsync: (success?: () => void, error?: (e: string) => void) => void;
      close: () => void;
    };

    recognizer.stopContinuousRecognitionAsync(
      () => {
        const finalTranscript = partsRef.current.join(" ");
        setTranscript(finalTranscript);
        setStatus("done");
        busyRef.current = false;
        try {
          recognizer.close();
        } catch {
          // ignore
        }
        recognizerRef.current = null;
      },
      () => {
        const finalTranscript = partsRef.current.join(" ");
        setTranscript(finalTranscript);
        setStatus("done");
        busyRef.current = false;
        cleanup();
      }
    );
  }, [status, cleanup]);

  const reset = useCallback(() => {
    cleanup();
    busyRef.current = false;
    partsRef.current = [];
    setStatus("idle");
    setTranscript("");
    setInterimText("");
    setError(null);
  }, [cleanup]);

  return { status, transcript, interimText, error, startRecording, stopRecording, reset };
}
