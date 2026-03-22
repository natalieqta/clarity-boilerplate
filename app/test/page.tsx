"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/clarity/Shell";
import { GhostButton, PrimaryButton } from "../components/clarity/Buttons";
import { RecordButton } from "../components/clarity/RecordButton";
import { WordFeedback } from "../components/clarity/WordFeedback";
import { MicPermission } from "../components/clarity/MicPermission";
import { useAzureSpeech } from "@/lib/speech/useAzureSpeech";
import { useTextToSpeech } from "@/lib/speech/useTextToSpeech";
import type { AssessmentResult } from "@/lib/speech/types";

const TEST_SENTENCES = [
  "We baked the prototype overnight and shipped it in the morning.",
  "The quarterly results exceeded expectations across all regions.",
  "Let me walk you through the architecture of this solution.",
  "We scheduled the deployment for next Thursday afternoon.",
  "The development team collaborated effectively on the project.",
  "Can you elaborate on the specific requirements for this feature?",
];

export default function QuickTestPage() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<AssessmentResult[]>([]);

  const sentence = TEST_SENTENCES[currentIndex];
  const progress = ((currentIndex + 1) / TEST_SENTENCES.length) * 100;
  const isLast = currentIndex === TEST_SENTENCES.length - 1;

  const { status, result, error, startRecording, stopRecording, reset } =
    useAzureSpeech({ referenceText: sentence });
  const { speak, playing } = useTextToSpeech();

  function handleNext() {
    if (result) {
      setResults((prev) => [...prev, result]);
    }
    if (isLast) {
      const allResults = result ? [...results, result] : results;
      sessionStorage.setItem(
        "clarity-test-results",
        JSON.stringify(allResults)
      );
      router.push("/results");
      return;
    }
    setCurrentIndex((i) => i + 1);
    reset();
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      reset();
    }
  }

  return (
    <Shell variant="narrow">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 lg:max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-clarity-purple">
              Quick diagnostic
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-clarity-ink sm:text-3xl">
              Read each sentence aloud
            </h1>
            <p className="mt-2 max-w-xl text-sm text-clarity-slate sm:text-base">
              We&apos;ll assess your pronunciation across {TEST_SENTENCES.length}{" "}
              sentences. Speak naturally, as if you&apos;re in a meeting.
            </p>
          </div>
          <p className="text-sm font-medium text-clarity-muted">
            Sentence {currentIndex + 1} of {TEST_SENTENCES.length}
          </p>
        </div>

        <div
          className="mb-6 h-2 w-full overflow-hidden rounded-full bg-clarity-periwinkle"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-clarity-purple transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
          <section className="rounded-2xl border border-clarity-periwinkle bg-white/70 p-5 shadow-sm sm:p-8">
            <h2 className="text-xl font-semibold text-clarity-ink sm:text-2xl">
              Say this sentence naturally:
            </h2>
            <blockquote className="mt-6 rounded-xl border border-dashed border-clarity-muted/60 bg-clarity-mist/80 px-5 py-6 text-lg font-medium leading-relaxed text-clarity-navy sm:text-xl">
              &ldquo;{sentence}&rdquo;
            </blockquote>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <RecordButton
                status={status}
                onStart={startRecording}
                onStop={stopRecording}
              />
              {status === "done" && result && (
                <span className="rounded-full bg-clarity-mist px-3 py-1 text-sm font-semibold text-clarity-purple ring-1 ring-clarity-periwinkle">
                  Score: {Math.round(result.scores.overallScore)}
                </span>
              )}
            </div>

            <MicPermission error={error} onRetry={() => reset()} />
          </section>

          <aside className="space-y-3 rounded-2xl border border-clarity-periwinkle bg-clarity-mist/50 p-4 sm:p-5 lg:sticky lg:top-20">
            {status === "done" && result ? (
              <>
                <p className="text-sm font-semibold text-clarity-navy">
                  Word-level feedback
                </p>
                <WordFeedback words={result.words} onPlayWord={(w) => speak(w, "slow")} />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: "Accuracy", value: result.scores.accuracyScore },
                    { label: "Fluency", value: result.scores.fluencyScore },
                    {
                      label: "Completeness",
                      value: result.scores.completenessScore,
                    },
                    { label: "Prosody", value: result.scores.prosodyScore },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="rounded-lg bg-white/80 px-2 py-1.5 text-center ring-1 ring-clarity-periwinkle"
                    >
                      <p className="text-xs text-clarity-muted">{s.label}</p>
                      <p className="text-lg font-bold tabular-nums text-clarity-ink">
                        {Math.round(s.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-clarity-navy">
                  Feedback
                </p>
                <p className="text-sm text-clarity-slate">
                  {status === "recording"
                    ? "Listening... speak the sentence now."
                    : status === "processing"
                      ? "Analyzing your pronunciation..."
                      : "Record the sentence to see word-level feedback here."}
                </p>
              </>
            )}
          </aside>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-clarity-periwinkle pt-6 sm:flex-row sm:justify-between">
          <GhostButton type="button" onClick={handleBack} disabled={currentIndex === 0}>
            Back
          </GhostButton>
          <PrimaryButton
            type="button"
            className="sm:min-w-[7rem]"
            onClick={handleNext}
            disabled={status === "recording" || status === "processing"}
          >
            {isLast ? "Finish & see results" : "Next"}
          </PrimaryButton>
        </div>
      </main>
    </Shell>
  );
}
