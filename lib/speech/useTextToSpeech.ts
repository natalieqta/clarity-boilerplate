"use client";

import { useState, useRef, useCallback } from "react";

async function fetchToken(): Promise<{ token: string; region: string }> {
  const res = await fetch("/api/speech-token");
  if (!res.ok) throw new Error("Token fetch failed");
  return res.json();
}

export type SpeechSpeed = "slow" | "normal";

function buildSSML(text: string, speed: SpeechSpeed): string {
  // Named SSML rates are much more noticeable than percentages
  // "x-slow" is roughly 50% of normal — very clear for learners
  // "slow" is about 80% — slightly relaxed but natural
  const rate = speed === "slow" ? "x-slow" : "slow";
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US"><voice name="en-US-JennyNeural"><prosody rate="${rate}">${text}</prosody></voice></speak>`;
}

export function useTextToSpeech() {
  const [playing, setPlaying] = useState(false);
  const synthRef = useRef<unknown>(null);

  const speak = useCallback(
    async (text: string, speed: SpeechSpeed = "slow") => {
      if (playing) return;
      setPlaying(true);

      try {
        const sdk = await import("microsoft-cognitiveservices-speech-sdk");
        const { token, region } = await fetchToken();

        const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(
          token,
          region
        );
        // Don't set voice on config — it's in the SSML
        const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        synthRef.current = synthesizer;

        const ssml = buildSSML(text, speed);

        synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              // success
            }
            synthesizer.close();
            synthRef.current = null;
            setPlaying(false);
          },
          (err) => {
            console.error("TTS error:", err);
            synthesizer.close();
            synthRef.current = null;
            setPlaying(false);
          }
        );
      } catch {
        setPlaying(false);
      }
    },
    [playing]
  );

  const stop = useCallback(() => {
    if (synthRef.current) {
      try {
        (synthRef.current as { close: () => void }).close();
      } catch {
        // ignore
      }
      synthRef.current = null;
    }
    setPlaying(false);
  }, []);

  return { speak, stop, playing };
}
