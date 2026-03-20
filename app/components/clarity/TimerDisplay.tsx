"use client";

import { useState, useEffect, useRef } from "react";

interface TimerDisplayProps {
  isRunning: boolean;
  onNudge?: () => void;
}

export function TimerDisplay({ isRunning, onNudge }: TimerDisplayProps) {
  const [elapsed, setElapsed] = useState(0);
  const nudgedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (isRunning) {
      setElapsed(0);
      nudgedRef.current = false;
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Nudge at 90s
  useEffect(() => {
    if (elapsed >= 90 && !nudgedRef.current && onNudge) {
      nudgedRef.current = true;
      onNudge();
    }
  }, [elapsed, onNudge]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  const display = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="font-mono text-3xl font-bold tabular-nums text-clarity-ink">
        {display}
      </span>
      {isRunning && (
        <span className="text-xs text-clarity-muted">
          {elapsed < 90 ? "Recording..." : ""}
        </span>
      )}
    </div>
  );
}
