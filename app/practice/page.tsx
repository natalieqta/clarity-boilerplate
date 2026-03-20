"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Shell } from "../components/clarity/Shell";
import { GhostButton, PrimaryButton } from "../components/clarity/Buttons";
import { RecordButton } from "../components/clarity/RecordButton";
import { WordFeedback } from "../components/clarity/WordFeedback";
import { MicPermission } from "../components/clarity/MicPermission";
import { useAzureSpeech } from "@/lib/speech/useAzureSpeech";
import { useTextToSpeech } from "@/lib/speech/useTextToSpeech";
import type { AssessmentResult, WordScore } from "@/lib/speech/types";

const TARGET_REPS = 5;
const MASTERY_THRESHOLD = 85;
const CONSECUTIVE_FOR_MASTERY = 3;

const PLAY_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
    <path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z" />
  </svg>
);

/* ─── Specific coaching from Azure word-level data ─── */
function buildCoachingFeedback(result: AssessmentResult): string {
  const { words, recognizedText, referenceText } = result;
  const score = result.scores.accuracyScore;

  // Find mispronounced words
  const mispronounced = words.filter(
    (w) => w.errorType === "Mispronunciation" && w.accuracyScore < 80
  );
  const omitted = words.filter((w) => w.errorType === "Omission");
  const inserted = words.filter((w) => w.errorType === "Insertion");

  if (score >= 95) {
    return "Excellent! Your pronunciation is spot-on.";
  }

  const tips: string[] = [];

  if (mispronounced.length > 0) {
    const wrongWords = mispronounced.map((w) => `"${w.word}"`).join(", ");
    tips.push(
      `Focus on ${wrongWords} — listen to the slow model and notice how each syllable sounds.`
    );
  }

  if (omitted.length > 0) {
    const missed = omitted.map((w) => `"${w.word}"`).join(", ");
    tips.push(`You skipped ${missed}. Make sure to pronounce every part.`);
  }

  if (inserted.length > 0) {
    tips.push(
      `You added extra sounds that aren't in the word. Try matching the model exactly.`
    );
  }

  // Compare what was heard vs reference
  if (
    tips.length === 0 &&
    recognizedText.toLowerCase().trim() !== referenceText.toLowerCase().trim()
  ) {
    tips.push(
      `We heard "${recognizedText}" instead of "${referenceText}". Listen to the model and try to match it exactly.`
    );
  }

  if (tips.length === 0) {
    if (score >= 85) return "Good! Just a bit more clarity and you've got it.";
    return "Try listening to the slow version and matching each sound carefully.";
  }

  return tips.join(" ");
}

/* ─── Check if mastered: N consecutive good reps ─── */
function checkMastery(results: AssessmentResult[]): boolean {
  if (results.length < CONSECUTIVE_FOR_MASTERY) return false;
  const tail = results.slice(-CONSECUTIVE_FOR_MASTERY);
  return tail.every((r) => r.scores.accuracyScore >= MASTERY_THRESHOLD);
}

/* ─── Count current consecutive streak ─── */
function getStreak(results: AssessmentResult[]): number {
  let streak = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].scores.accuracyScore >= MASTERY_THRESHOLD) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

function PracticeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const word = searchParams.get("word") ?? "baked";
  const [currentRep, setCurrentRep] = useState(1);
  const [repResults, setRepResults] = useState<AssessmentResult[]>([]);
  const [mastered, setMastered] = useState(false);

  const { status, result, error, startRecording, stopRecording, reset } =
    useAzureSpeech({ referenceText: word });
  const { speak, playing } = useTextToSpeech();

  const latestScore = result?.scores.accuracyScore ?? null;
  const isGoodAttempt = latestScore !== null && latestScore >= MASTERY_THRESHOLD;
  const isRecordingOrProcessing =
    status === "recording" || status === "processing";

  function handleNextRep() {
    if (result) {
      const updated = [...repResults, result];
      setRepResults(updated);

      if (checkMastery(updated)) {
        setMastered(true);
        return;
      }
    }

    setCurrentRep((r) => r + 1);
    reset();
  }

  function handleRetry() {
    reset();
  }

  // Scores for display
  const allResults = result ? [...repResults, result] : repResults;
  const streak = getStreak(allResults);
  const goodReps = allResults.filter(
    (r) => r.scores.accuracyScore >= MASTERY_THRESHOLD
  ).length;

  return (
    <Shell variant="narrow">
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 sm:max-w-2xl sm:px-6 sm:py-10 lg:max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-clarity-purple">
              Pronunciation coach
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-clarity-ink sm:text-3xl">
              Practice:{" "}
              <span className="text-clarity-violet">{word}</span>
            </h1>
          </div>
          <span className="inline-flex w-fit items-center rounded-full bg-clarity-mist px-3 py-1 text-xs font-semibold text-clarity-navy ring-1 ring-clarity-periwinkle">
            Rep {currentRep}
          </span>
        </div>

        {/* Progress dots */}
        <div className="mb-6 flex items-center gap-2">
          {repResults.map((r, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${
                r.scores.accuracyScore >= MASTERY_THRESHOLD
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            />
          ))}
          {!mastered && (
            <div className="h-2.5 w-2.5 scale-125 rounded-full bg-clarity-purple" />
          )}
          <span className="ml-2 text-xs text-clarity-muted">
            {streak >= 1 && (
              <span className="font-semibold text-green-600">
                {streak}/{CONSECUTIVE_FOR_MASTERY} streak
              </span>
            )}
            {streak === 0 && `${goodReps} good reps`}
            {" · "}
            {CONSECUTIVE_FOR_MASTERY} in a row to master
          </span>
        </div>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_340px] lg:items-stretch">
          {/* Main area — listen + record on ONE screen */}
          <section className="flex flex-col rounded-2xl border border-clarity-periwinkle bg-white/80 p-5 shadow-sm sm:p-8">
            {mastered ? (
              /* ─── Mastered state ─── */
              <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-green-600">
                  &#10003;
                </div>
                <h2 className="text-2xl font-bold text-green-800">Mastered!</h2>
                <p className="max-w-sm text-sm text-clarity-slate">
                  You scored {MASTERY_THRESHOLD}+ on {CONSECUTIVE_FOR_MASTERY}{" "}
                  consecutive reps. This word is locked in.
                </p>
                <PrimaryButton
                  type="button"
                  onClick={() => router.push("/results")}
                  className="mt-4"
                >
                  Back to results
                </PrimaryButton>
              </div>
            ) : (
              /* ─── Active practice ─── */
              <div className="flex flex-1 flex-col">
                {/* The word */}
                <div className="text-center">
                  <p className="text-sm text-clarity-slate">
                    Listen, then record
                  </p>
                  <p className="mt-2 text-4xl font-bold tracking-tight text-clarity-ink sm:text-5xl">
                    {word}
                  </p>
                </div>

                {/* Listen buttons */}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => speak(word, "slow")}
                    disabled={playing || isRecordingOrProcessing}
                    className="inline-flex items-center gap-2 rounded-full bg-clarity-purple px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clarity-purple/90 disabled:opacity-50"
                  >
                    {PLAY_ICON}
                    {playing ? "Playing..." : "Slow"}
                  </button>
                  <button
                    type="button"
                    onClick={() => speak(word, "normal")}
                    disabled={playing || isRecordingOrProcessing}
                    className="inline-flex items-center gap-2 rounded-full bg-clarity-mist px-4 py-2 text-sm font-semibold text-clarity-purple ring-1 ring-clarity-periwinkle transition hover:bg-clarity-periwinkle disabled:opacity-50"
                  >
                    {PLAY_ICON}
                    Normal
                  </button>
                </div>

                {/* Record button */}
                <div className="mt-8 flex flex-col items-center gap-2">
                  <RecordButton
                    status={status}
                    onStart={startRecording}
                    onStop={stopRecording}
                  />
                  {playing && (
                    <p className="text-xs text-clarity-muted">
                      Wait for playback to finish before recording
                    </p>
                  )}
                </div>

                <MicPermission error={error} onRetry={() => reset()} />

                {/* ─── Feedback (inline, no separate step) ─── */}
                {status === "done" && result && (
                  <div className="mt-6 space-y-4">
                    {/* Score + coaching */}
                    <div
                      className={`rounded-xl border px-4 py-4 ${
                        isGoodAttempt
                          ? "border-green-200 bg-green-50"
                          : "border-yellow-200 bg-yellow-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-3xl font-bold tabular-nums ${
                            isGoodAttempt
                              ? "text-green-600"
                              : "text-yellow-600"
                          }`}
                        >
                          {Math.round(result.scores.accuracyScore)}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-clarity-ink">
                            {buildCoachingFeedback(result)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <GhostButton
                        type="button"
                        className="flex-1"
                        onClick={handleRetry}
                      >
                        Try again
                      </GhostButton>
                      <PrimaryButton
                        type="button"
                        className="flex-1"
                        onClick={handleNextRep}
                      >
                        Next rep &rarr;
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            {/* Attempt details */}
            <div className="rounded-2xl border border-clarity-periwinkle bg-clarity-mist/70 p-5">
              <h2 className="text-sm font-semibold text-clarity-navy">
                {status === "done" && result ? "Your attempt" : "Tips"}
              </h2>
              {status === "done" && result ? (
                <>
                  <p className="mt-3 text-sm text-clarity-slate">We heard:</p>
                  <p className="mt-2 text-lg font-semibold text-clarity-ink">
                    {result.recognizedText || "(no speech detected)"}
                  </p>
                  <div className="mt-3">
                    <WordFeedback words={result.words} />
                  </div>
                </>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-clarity-slate">
                  <li>
                    <span className="font-medium text-clarity-navy">1.</span>{" "}
                    Tap <strong>Slow</strong> to hear the word broken down
                  </li>
                  <li>
                    <span className="font-medium text-clarity-navy">2.</span>{" "}
                    Tap <strong>Record</strong> and say it
                  </li>
                  <li>
                    <span className="font-medium text-clarity-navy">3.</span>{" "}
                    Read the specific feedback and try again
                  </li>
                  <li>
                    <span className="font-medium text-clarity-navy">4.</span>{" "}
                    Score {MASTERY_THRESHOLD}+ three times in a row to master
                  </li>
                </ul>
              )}
            </div>

            {/* Rep history */}
            {repResults.length > 0 && (
              <div className="rounded-2xl border border-dashed border-clarity-muted/70 bg-clarity-bg/50 p-5">
                <h2 className="text-sm font-semibold text-clarity-navy">
                  History
                </h2>
                <div className="mt-2 space-y-1.5">
                  {repResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-clarity-slate">Rep {i + 1}</span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${
                          r.scores.accuracyScore >= MASTERY_THRESHOLD
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {Math.round(r.scores.accuracyScore)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Footer nav */}
        <div className="mt-8 flex flex-col gap-3 border-t border-clarity-periwinkle pt-6 sm:flex-row sm:justify-between">
          <Link
            href="/results"
            className="inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium text-clarity-purple hover:underline"
          >
            &larr; Back to results
          </Link>
          <PrimaryButton
            type="button"
            onClick={() => router.push("/results")}
          >
            Done
          </PrimaryButton>
        </div>
      </main>
    </Shell>
  );
}

export default function PracticePage() {
  return (
    <Suspense>
      <PracticeContent />
    </Suspense>
  );
}
