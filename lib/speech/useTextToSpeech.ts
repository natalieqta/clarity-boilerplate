"use client";

import { useState, useRef, useCallback } from "react";

export type SpeechSpeed = "slow" | "normal";

export function useTextToSpeech() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speak = useCallback(
    (text: string, speed: SpeechSpeed = "slow"): Promise<void> => {
      if (playing) return Promise.resolve();

      return new Promise<void>((resolve) => {
        setPlaying(true);

        fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, speed }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("TTS request failed");
            return res.blob();
          })
          .then((blob) => {
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
              URL.revokeObjectURL(url);
              audioRef.current = null;
              setPlaying(false);
              resolve();
            };

            audio.play().catch(() => {
              URL.revokeObjectURL(url);
              audioRef.current = null;
              setPlaying(false);
              resolve();
            });
          })
          .catch(() => {
            setPlaying(false);
            resolve();
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
    setPlaying(false);
  }, []);

  return { speak, stop, playing };
}
