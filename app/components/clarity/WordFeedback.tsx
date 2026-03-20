"use client";

import type { WordScore } from "@/lib/speech/types";

interface WordFeedbackProps {
  words: WordScore[];
}

function scoreColor(score: number, errorType: string) {
  if (errorType === "Omission") return "bg-red-100 text-red-800 line-through";
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function WordFeedback({ words }: WordFeedbackProps) {
  if (words.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {words.map((w, i) => (
        <span
          key={`${w.word}-${i}`}
          className={`rounded-lg px-2 py-1 text-sm font-medium ${scoreColor(w.accuracyScore, w.errorType)}`}
          title={`${w.word}: ${Math.round(w.accuracyScore)}%`}
        >
          {w.word}
          <span className="ml-1 text-xs opacity-70">
            {Math.round(w.accuracyScore)}
          </span>
        </span>
      ))}
    </div>
  );
}
