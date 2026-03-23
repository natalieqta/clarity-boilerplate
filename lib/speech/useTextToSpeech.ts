"use client";

import { useState, useRef, useCallback } from "react";

export type SpeechSpeed = "slow" | "normal";

/** Browser SpeechSynthesis fallback when ElevenLabs is unavailable */
function browserSpeak(text: string, speed: SpeechSpeed): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speed === "slow" ? 0.6 : 1.0;
    utterance.lang = "en-US";
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

export function useTextToSpeech() {
  const [playing, setPlaying] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    (text: string, speed: SpeechSpeed = "slow"): Promise<void> => {
      if (playing) return Promise.resolve();

      setTtsError(null);
      setPlaying(true);

      return fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speed }),
      })
        .then((res) => {
          if (!res.ok) throw new Error(`TTS request failed: ${res.status}`);
          return res.blob();
        })
        .then((blob) => {
          return new Promise<void>((resolve) => {
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
              URL.revokeObjectURL(url);
              audioRef.current = null;
              setPlaying(false);
              resolve();
            };

            audio.onerror = () => {
              console.error("Audio playback failed for:", text);
              URL.revokeObjectURL(url);
              audioRef.current = null;
              setPlaying(false);
              resolve();
            };

            audio.play().catch((err) => {
              console.error("Audio play() blocked:", err);
              URL.revokeObjectURL(url);
              audioRef.current = null;
              setPlaying(false);
              resolve();
            });
          });
        })
        .catch((err) => {
          // ElevenLabs failed — fall back to browser TTS
          console.error("ElevenLabs TTS failed, using browser fallback:", err);
          setTtsError("Using browser voice (ElevenLabs unavailable)");
          return browserSpeak(text, speed).finally(() => {
            setPlaying(false);
          });
        });
    },
    [playing]
  );

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
  }, []);

  return { speak, stop, playing, ttsError };
}
