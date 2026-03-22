"use client";

import type { WordScore } from "@/lib/speech/types";

interface WordFeedbackProps {
  words: WordScore[];
  onPlayWord?: (word: string) => void;
}

function scoreColor(score: number, errorType: string) {
  if (errorType === "Omission") return "bg-red-100 text-red-800 line-through";
  if (score >= 80) return "bg-green-100 text-green-800";
  if (score >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

function needsHelp(word: WordScore): boolean {
  return word.accuracyScore < 80 || word.errorType !== "None";
}

const SpeakerIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
    <path d="M7.557 2.066A.75.75 0 0 1 8 2.75v10.5a.75.75 0 0 1-1.248.56L3.59 11H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.59l3.162-2.81a.75.75 0 0 1 .805-.124ZM12.95 3.05a.75.75 0 1 0-1.06 1.06 5.5 5.5 0 0 1 0 7.78.75.75 0 1 0 1.06 1.06 7 7 0 0 0 0-9.9ZM10.828 5.172a.75.75 0 1 0-1.06 1.06 2.5 2.5 0 0 1 0 3.536.75.75 0 1 0 1.06 1.06 4 4 0 0 0 0-5.656Z" />
  </svg>
);

export function WordFeedback({ words, onPlayWord }: WordFeedbackProps) {
  if (words.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {words.map((w, i) => (
        <span
          key={`${w.word}-${i}`}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium ${scoreColor(w.accuracyScore, w.errorType)}`}
          title={`${w.word}: ${Math.round(w.accuracyScore)}%`}
        >
          {w.word}
          <span className="text-xs opacity-70">
            {Math.round(w.accuracyScore)}
          </span>
          {onPlayWord && needsHelp(w) && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPlayWord(w.word);
              }}
              className="ml-0.5 rounded-full p-0.5 opacity-60 transition hover:opacity-100"
              title={`Hear "${w.word}"`}
            >
              {SpeakerIcon}
            </button>
          )}
        </span>
      ))}
    </div>
  );
}
