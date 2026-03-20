"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shell } from "../../components/clarity/Shell";
import { PrimaryButton, GhostButton } from "../../components/clarity/Buttons";
import { ScoreCircle } from "../../components/clarity/ScoreCircle";
import { SubScoreGrid } from "../../components/clarity/SubScoreGrid";
import { FrameworkChecklist } from "../../components/clarity/FrameworkChecklist";
import { FillerHighlight } from "../../components/clarity/FillerHighlight";
import type { WhatSessionData } from "@/lib/types/what";

export default function WhatResultsPage() {
  const router = useRouter();
  const [session, setSession] = useState<WhatSessionData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("clarity-what-results");
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        // invalid
      }
    }
  }, []);

  if (!session) {
    return (
      <Shell>
        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-clarity-ink">No results yet</h1>
          <p className="mt-2 text-sm text-clarity-slate">
            Take the message clarity exercise first to see your scores.
          </p>
          <Link
            href="/what"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-clarity-purple px-6 text-sm font-semibold text-white shadow-sm hover:brightness-95"
          >
            Start now &rarr;
          </Link>
        </main>
      </Shell>
    );
  }

  const { prompt, transcript, analysis, durationSeconds } = session;
  const fillerCount = analysis.filler_words_found.length;

  const subScores = [
    { label: "Framework", score: analysis.framework_score, maxScore: 25 },
    { label: "Speed to point", score: analysis.speed_score, maxScore: 25 },
    { label: "Conciseness", score: analysis.conciseness_score, maxScore: 25 },
    { label: "Filler words", score: analysis.filler_score, maxScore: 25 },
  ];

  return (
    <Shell>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-clarity-violet">Message clarity</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-clarity-ink sm:text-3xl">
            Your results
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="rounded-full bg-clarity-violet/10 px-3 py-1 text-xs font-semibold text-clarity-violet">
              {prompt.mode === "work" ? "Work scenario" : "On-the-spot"}
            </span>
            <span className="text-xs text-clarity-muted">
              {Math.floor(durationSeconds / 60)}:{(durationSeconds % 60).toString().padStart(2, "0")} duration
            </span>
          </div>
          <blockquote className="mt-3 border-l-4 border-clarity-purple/30 pl-4 text-sm italic text-clarity-slate">
            {prompt.text}
          </blockquote>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* Left column: scores */}
          <div className="flex flex-col items-center gap-6 lg:sticky lg:top-20 lg:self-start">
            <ScoreCircle score={analysis.overall_score} label="Message score" />
            <SubScoreGrid scores={subScores} />
          </div>

          {/* Right column: details */}
          <div className="flex flex-col gap-6">
            {/* Framework checklist */}
            <section className="rounded-2xl border border-clarity-periwinkle bg-white/80 p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-clarity-navy">
                Framework check
              </h2>
              <p className="mt-1 text-xs text-clarity-slate">
                Did your response hit all four parts of a clear message?
              </p>
              <div className="mt-4">
                <FrameworkChecklist breakdown={analysis.framework_breakdown} />
              </div>
            </section>

            {/* Coaching note */}
            <section className="rounded-2xl border border-clarity-purple/30 bg-clarity-purple/5 p-5">
              <h2 className="text-sm font-semibold text-clarity-purple">
                Coach&apos;s note
              </h2>
              <p className="mt-2 text-sm font-medium leading-relaxed text-clarity-ink">
                {analysis.top_coaching_note}
              </p>
            </section>

            {/* Rewrite suggestion */}
            {analysis.rewrite_suggestion && (
              <section className="rounded-2xl border border-clarity-periwinkle bg-white/80 p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-clarity-navy">
                  Stronger opener
                </h2>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-dashed border-clarity-muted/40 bg-clarity-mist/30 p-3">
                    <p className="text-xs font-semibold text-clarity-muted">Your version</p>
                    <p className="mt-1 text-sm text-clarity-slate">
                      {analysis.first_clear_point_sentence ?? "(main point not clearly stated)"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-clarity-purple/20 bg-clarity-purple/5 p-3">
                    <p className="text-xs font-semibold text-clarity-purple">Suggested</p>
                    <p className="mt-1 text-sm text-clarity-ink">
                      {analysis.rewrite_suggestion}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Transcript with filler highlights */}
            <section className="rounded-2xl border border-clarity-periwinkle bg-white/80 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-clarity-navy">
                  Your transcript
                </h2>
                {fillerCount > 0 && (
                  <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    {fillerCount} filler{fillerCount !== 1 ? "s" : ""} found
                  </span>
                )}
              </div>
              <div className="mt-3">
                <FillerHighlight
                  transcript={transcript}
                  fillerWords={analysis.filler_words_found}
                />
              </div>
            </section>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 border-t border-clarity-periwinkle pt-6 sm:flex-row sm:justify-between">
          <Link
            href="/what"
            className="inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium text-clarity-purple hover:underline"
          >
            &larr; New prompt
          </Link>
          <div className="flex gap-3">
            <GhostButton
              type="button"
              onClick={() => router.push("/what/record")}
            >
              Practice again
            </GhostButton>
            <PrimaryButton
              type="button"
              onClick={() => router.push("/what")}
            >
              New prompt
            </PrimaryButton>
          </div>
        </div>
      </main>
    </Shell>
  );
}
