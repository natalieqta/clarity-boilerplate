"use client";

import type { AssessmentError } from "@/lib/speech/types";

interface MicPermissionProps {
  error: AssessmentError | null;
  onRetry: () => void;
}

export function MicPermission({ error, onRetry }: MicPermissionProps) {
  if (!error) return null;

  const isMicError = error.code === "mic-denied" || error.code === "mic-unavailable";

  return (
    <div
      className={`rounded-xl border p-4 text-sm ${
        isMicError
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-yellow-200 bg-yellow-50 text-yellow-800"
      }`}
    >
      <p className="font-medium">{error.message}</p>
      {isMicError && (
        <p className="mt-1 text-xs opacity-80">
          Check your browser&apos;s address bar for the mic icon, or go to
          Settings &gt; Privacy &gt; Microphone.
        </p>
      )}
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 text-xs font-semibold underline"
      >
        Try again
      </button>
    </div>
  );
}
