"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Shell } from "../components/clarity/Shell";
import { LinkButton } from "../components/clarity/Buttons";
import { useTextToSpeech } from "@/lib/speech/useTextToSpeech";
import { createClient } from "@/lib/supabase/client";
import { saveSession } from "@/lib/supabase/sessions";
import type { AssessmentResult, WordScore } from "@/lib/speech/types";

function computeOverallScore(results: AssessmentResult[]): number {
  if (results.length === 0) return 0;
  const sum = results.reduce((acc, r) => acc + r.scores.overallScore, 0);
  return Math.round(sum / results.length);
}

function computeAverages(results: AssessmentResult[]) {
  if (results.length === 0)
    return { accuracy: 0, fluency: 0, completeness: 0, prosody: 0 };
  const len = results.length;
  return {
    accuracy: Math.round(
      results.reduce((a, r) => a + r.scores.accuracyScore, 0) / len
    ),
    fluency: Math.round(
      results.reduce((a, r) => a + r.scores.fluencyScore, 0) / len
    ),
    completeness: Math.round(
      results.reduce((a, r) => a + r.scores.completenessScore, 0) / len
    ),
    prosody: Math.round(
      results.reduce((a, r) => a + r.scores.prosodyScore, 0) / len
    ),
  };
}

const STOP_WORDS = new Set([
  "the", "a", "an", "we", "i", "to", "it", "is", "in", "of",
  "or", "and", "be", "do", "he", "she", "me", "my", "you",
  "for", "so", "no", "up", "if", "on", "at", "by", "as",
  "can", "but", "not", "all", "has", "had", "was", "are",
  "his", "her", "its", "our", "let", "this", "that",
]);

function findWeakWords(results: AssessmentResult[]): WordScore[] {
  const allWords = results.flatMap((r) => r.words);
  return allWords
    .filter(
      (w) =>
        w.accuracyScore < 75 &&
        w.errorType !== "None" &&
        w.word.length >= 3 &&
        !STOP_WORDS.has(w.word.toLowerCase())
    )
    .sort((a, b) => a.accuracyScore - b.accuracyScore)
    .slice(0, 6);
}

function getSummaryText(score: number): string {
  if (score >= 85)
    return "Excellent clarity. A few small polish areas below.";
  if (score >= 70)
    return "Strong foundation. Targeted practice on the words below will make a noticeable difference.";
  if (score >= 50)
    return "Good start. Focus on the priority areas below and you'll improve quickly.";
  return "Let's build from here. The drills below target your biggest opportunities.";
}

export default function ResultsPage() {
  const [testResults, setTestResults] = useState<AssessmentResult[] | null>(
    null
  );
  const { speak, playing } = useTextToSpeech();
  const hasSaved = useRef(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("clarity-test-results");
    if (stored) {
      try {
        setTestResults(JSON.parse(stored));
      } catch {
        // invalid data
      }
    }
  }, []);

  // Save session to Supabase if user is logged in
  useEffect(() => {
    if (!testResults || hasSaved.current) return;
    hasSaved.current = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        const overall = Math.round(
          testResults.reduce((a, r) => a + r.scores.overallScore, 0) / testResults.length
        );
        saveSession(user.email, "how", testResults as unknown as Record<string, unknown>, overall);
      }
    });
  }, [testResults]);

  // Fallback static content when no test data
  if (!testResults) {
    return (
      <Shell>
        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
          <header className="text-center">
            <p className="text-sm font-semibold text-clarity-purple">
              No results yet
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-clarity-ink sm:text-4xl">
              Take the quick test first
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-clarity-slate">
              Record a few sentences so we can assess your pronunciation and
              build a personalized practice plan.
            </p>
            <LinkButton href="/test" className="mt-6">
              Start quick test
            </LinkButton>
          </header>
        </main>
      </Shell>
    );
  }

  const overall = computeOverallScore(testResults);
  const averages = computeAverages(testResults);
  const weakWords = findWeakWords(testResults);

  const suggestions = [
    ...(weakWords.length > 0
      ? [
          {
            title: "Words to practice",
            detail: weakWords.map((w) => w.word).join(", "),
            href: `/practice?word=${encodeURIComponent(weakWords[0].word)}`,
            accent: "bg-clarity-lime/90 text-clarity-ink",
            weakWordsList: weakWords,
          },
        ]
      : []),
    ...(averages.fluency < 75
      ? [
          {
            title: "Fluency & pace",
            detail:
              "Work on speaking smoothly without long pauses between words.",
            href: "/test",
            accent: "bg-clarity-violet text-white",
          },
        ]
      : []),
    ...(averages.prosody < 75
      ? [
          {
            title: "Intonation & stress",
            detail:
              "Practice natural rhythm — stress the right syllables and vary your pitch.",
            href: "/test",
            accent:
              "bg-clarity-mist text-clarity-navy ring-1 ring-clarity-periwinkle",
          },
        ]
      : []),
    ...(averages.completeness < 80
      ? [
          {
            title: "Word endings",
            detail:
              "Some words were partially dropped. Focus on completing each word fully.",
            href: weakWords.length > 0
              ? `/practice?word=${encodeURIComponent(weakWords[0].word)}`
              : "/test",
            accent: "bg-clarity-lime/90 text-clarity-ink",
          },
        ]
      : []),
  ];

  // Ensure at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      title: "Keep practicing",
      detail: "Your scores are great! Keep it up with regular practice.",
      href: "/test",
      accent: "bg-clarity-lime/90 text-clarity-ink",
    });
  }

  return (
    <Shell>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 sm:py-12">
        <header className="text-center lg:text-left">
          <p className="text-sm font-semibold text-clarity-purple">
            Your results
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-clarity-ink sm:text-4xl">
            Here&apos;s where to focus first
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-clarity-slate lg:mx-0">
            Based on {testResults.length} sentence{testResults.length !== 1 ? "s" : ""} you just recorded.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
          <section className="mx-auto flex w-full max-w-sm flex-col items-center glass-card p-8 lg:mx-0 lg:sticky lg:top-24">
            <div
              className="relative flex h-44 w-44 items-center justify-center rounded-full bg-clarity-mist ring-4 ring-clarity-purple/25"
              aria-label={`Score ${overall} out of 100`}
            >
              <div className="text-center">
                <span className="block text-5xl font-bold tabular-nums text-clarity-ink">
                  {overall}
                </span>
                <span className="text-sm font-medium text-clarity-muted">
                  Clarity score
                </span>
              </div>
            </div>

            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              {[
                { label: "Accuracy", value: averages.accuracy },
                { label: "Fluency", value: averages.fluency },
                { label: "Complete", value: averages.completeness },
                { label: "Prosody", value: averages.prosody },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-lg bg-clarity-mist/80 px-2 py-1.5 text-center ring-1 ring-clarity-periwinkle"
                >
                  <p className="text-xs text-clarity-muted">{s.label}</p>
                  <p className="text-lg font-bold tabular-nums text-clarity-ink">
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 text-center text-sm leading-relaxed text-clarity-slate">
              {getSummaryText(overall)}
            </p>
            {weakWords.length > 0 && (
              <LinkButton
                href={`/practice?word=${encodeURIComponent(weakWords[0].word)}`}
                className="mt-6 w-full sm:w-auto"
              >
                Practice top pick
              </LinkButton>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-clarity-ink">
              Suggested focus areas
            </h2>
            <ul className="grid gap-4 sm:grid-cols-1 xl:grid-cols-2">
              {suggestions.map((s) => (
                <li key={s.title}>
                  <div className="flex h-full flex-col rounded-2xl border border-clarity-periwinkle bg-gradient-to-br from-clarity-mist/90 to-clarity-bg p-5 transition hover:border-clarity-purple/50 hover:shadow-md">
                    <span
                      className={`inline-flex w-fit rounded-lg px-2 py-0.5 text-xs font-semibold ${s.accent}`}
                    >
                      Priority
                    </span>
                    <span className="mt-3 text-lg font-semibold text-clarity-ink">
                      {s.title}
                    </span>
                    {"weakWordsList" in s && s.weakWordsList ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(s.weakWordsList as WordScore[]).map((w, i) => (
                          <div
                            key={`${w.word}-${i}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 ring-1 ring-red-200 transition hover:bg-red-100 hover:ring-red-300"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                speak(w.word, "slow");
                              }}
                              disabled={playing}
                              className="rounded-full p-0.5 text-red-500 transition hover:text-red-700 disabled:opacity-50"
                              title={`Hear "${w.word}"`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4">
                                <path d="M7.557 2.066A.75.75 0 0 1 8 2.75v10.5a.75.75 0 0 1-1.248.56L3.59 11H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.59l3.162-2.81a.75.75 0 0 1 .805-.124ZM12.95 3.05a.75.75 0 1 0-1.06 1.06 5.5 5.5 0 0 1 0 7.78.75.75 0 1 0 1.06 1.06 7 7 0 0 0 0-9.9ZM10.828 5.172a.75.75 0 1 0-1.06 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 1 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
                              </svg>
                            </button>
                            <Link
                              href={`/practice?word=${encodeURIComponent(w.word)}`}
                              className="inline-flex items-center gap-1 text-red-800 hover:text-clarity-purple"
                            >
                              {w.word}
                              <span className="text-xs font-medium text-clarity-purple">Practice &rarr;</span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="mt-2 flex-1 text-sm text-clarity-slate">
                        {s.detail}
                      </span>
                    )}
                    <Link
                      href={s.href}
                      className="mt-4 text-sm font-semibold text-clarity-purple hover:underline"
                    >
                      Open drill &rarr;
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="text-center text-sm text-clarity-muted lg:text-left">
          <Link href="/test" className="text-clarity-purple hover:underline">
            Retake quick test
          </Link>
          <span className="mx-2">&middot;</span>
          <Link href="/" className="text-clarity-purple hover:underline">
            Home
          </Link>
        </p>
      </main>
    </Shell>
  );
}
