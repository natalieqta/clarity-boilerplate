"use client";

import type { AssessmentStatus } from "@/lib/speech/types";

interface RecordButtonProps {
  status: AssessmentStatus;
  onStart: () => void;
  onStop: () => void;
}

export function RecordButton({ status, onStart, onStop }: RecordButtonProps) {
  const isRecording = status === "recording";
  const isProcessing = status === "processing" || status === "requesting-mic";
  const disabled = isProcessing;

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Pulsing ring when recording */}
      {isRecording && (
        <span className="absolute h-[4.5rem] w-[4.5rem] animate-ping rounded-full bg-red-400/30" />
      )}
      <button
        type="button"
        onClick={isRecording ? onStop : onStart}
        disabled={disabled}
        className={`relative inline-flex h-14 min-w-[8rem] items-center justify-center gap-2 rounded-full px-8 text-sm font-bold shadow-md ring-2 transition-all disabled:opacity-50 ${
          isRecording
            ? "scale-105 bg-red-100 text-red-700 ring-red-300 hover:bg-red-200"
            : "bg-clarity-lime text-clarity-ink ring-clarity-ink/10 hover:brightness-95"
        }`}
      >
        {isRecording && (
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
          </span>
        )}
        {isProcessing && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-clarity-ink/30 border-t-clarity-ink" />
        )}
        {status === "idle" || status === "ready" || status === "done" || status === "error"
          ? "Tap to record"
          : isRecording
            ? "Stop"
            : "Analyzing..."}
      </button>
    </div>
  );
}
