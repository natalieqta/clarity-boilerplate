"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../../components/clarity/Shell";
import { LimeButton, GhostButton } from "../../components/clarity/Buttons";
import { MicPermission } from "../../components/clarity/MicPermission";
import { TimerDisplay } from "../../components/clarity/TimerDisplay";
import { useSpeechToText } from "@/lib/speech/useSpeechToText";
import type { WhatPrompt, WhatAnalysis, WhatSessionData } from "@/lib/types/what";

export default function WhatRecordPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState<WhatPrompt | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);

  const { status, transcript, interimText, error, startRecording, stopRecording, reset } =
    useSpeechToText();

  // Load prompt from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("clarity-what-prompt");
    if (stored) {
      try {
        setPrompt(JSON.parse(stored));
      } catch {
        router.push("/what");
      }
    } else {
      router.push("/what");
    }
  }, [router]);

  async function handleStop() {
    stopRecording();
  }

  // When status becomes "done", send to Claude for analysis
  useEffect(() => {
    if (status !== "done" || !transcript || !prompt || analyzing) return;

    const analyze = async () => {
      setAnalyzing(true);
      setAnalyzeError(null);

      try {
        const res = await fetch("/api/analyze-message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript, prompt: prompt.text }),
        });

        if (!res.ok) {
          throw new Error("Analysis failed");
        }

        const analysis: WhatAnalysis = await res.json();
        const elapsed = Math.round((Date.now() - startTimeRef.current) / 1000);

        const sessionData: WhatSessionData = {
          prompt,
          transcript,
          analysis,
          durationSeconds: elapsed,
          timestamp: Date.now(),
        };

        sessionStorage.setItem("clarity-what-results", JSON.stringify(sessionData));
        router.push("/what/results");
      } catch {
        setAnalyzeError("Could not analyze your response. Please try again.");
        setAnalyzing(false);
      }
    };

    analyze();
  }, [status, transcript, prompt, analyzing, router]);

  function handleStart() {
    startTimeRef.current = Date.now();
    setShowNudge(false);
    setAnalyzeError(null);
    startRecording();
  }

  if (!prompt) {
    return (
      <Shell variant="narrow">
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-clarity-muted">Loading prompt...</p>
        </main>
      </Shell>
    );
  }

  const isRecording = status === "recording";
  const isDone = status === "done" || analyzing;

  return (
    <Shell variant="narrow">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10">
        {/* Prompt */}
        <div className="mb-6">
          <span className="rounded-full bg-clarity-violet/10 px-3 py-1 text-xs font-semibold text-clarity-violet">
            {prompt.mode === "work" ? "Work scenario" : "On-the-spot"}
          </span>
          <blockquote className="mt-3 border-l-4 border-clarity-purple pl-4 text-lg font-medium leading-relaxed text-clarity-ink">
            {prompt.text}
          </blockquote>
        </div>

        {/* Recording area */}
        <section className="flex flex-1 flex-col items-center rounded-2xl border border-clarity-periwinkle bg-white/80 p-6 shadow-sm">
          {/* Timer */}
          <TimerDisplay
            isRunning={isRecording}
            onNudge={() => setShowNudge(true)}
          />

          {/* Nudge */}
          {showNudge && isRecording && (
            <p className="mt-2 animate-pulse text-center text-xs font-medium text-clarity-violet">
              Aim to land your point by now
            </p>
          )}

          {/* Status indicator */}
          {isRecording && (
            <div className="mt-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm font-medium text-red-600">Recording</span>
            </div>
          )}

          {isDone && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium text-clarity-purple">
                {analyzing ? "Analyzing your response..." : "Done"}
              </span>
              {analyzing && (
                <svg className="h-4 w-4 animate-spin text-clarity-purple" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6">
            {status === "idle" && !analyzing && (
              <LimeButton type="button" onClick={handleStart}>
                Start recording
              </LimeButton>
            )}
            {isRecording && (
              <button
                type="button"
                onClick={handleStop}
                className="inline-flex h-14 min-w-[10rem] items-center justify-center gap-2 rounded-full bg-red-500 px-8 text-sm font-bold text-white shadow-md ring-2 ring-red-500/20 transition hover:bg-red-600"
              >
                <span className="h-3 w-3 rounded-sm bg-white" />
                Stop &amp; analyze
              </button>
            )}
          </div>

          {analyzeError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center">
              <p className="text-sm text-red-700">{analyzeError}</p>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setAnalyzing(false);
                }}
                className="mt-2 text-sm font-medium text-red-600 underline"
              >
                Try again
              </button>
            </div>
          )}

          <MicPermission error={error} onRetry={reset} />

          {/* Live transcript */}
          {(transcript || interimText) && (
            <div className="mt-6 w-full rounded-xl bg-clarity-mist/50 px-4 py-3">
              <p className="text-xs font-semibold uppercase text-clarity-muted">
                Live transcript
              </p>
              <p className="mt-2 text-sm leading-relaxed text-clarity-slate">
                {transcript}
                {interimText && (
                  <span className="text-clarity-muted/70"> {interimText}</span>
                )}
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <div className="mt-6 flex justify-between">
          <GhostButton
            type="button"
            onClick={() => router.push("/what")}
          >
            &larr; Change prompt
          </GhostButton>
        </div>
      </main>
    </Shell>
  );
}
