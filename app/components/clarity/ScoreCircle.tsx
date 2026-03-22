"use client";

import { useEffect, useState } from "react";

interface ScoreCircleProps {
  score: number;
  label?: string;
  size?: number;
}

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e"; // green-500
  if (score >= 60) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

export function ScoreCircle({ score, label = "Clarity score", size = 176 }: ScoreCircleProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [mounted, setMounted] = useState(false);

  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = mounted ? (animatedScore / 100) * circumference : 0;
  const offset = circumference - progress;
  const color = scoreColor(score);

  useEffect(() => {
    setMounted(true);
    let frame: number;
    const duration = 1000;
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`Score ${Math.round(score)} out of 100`}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--clarity-periwinkle)"
          strokeWidth={strokeWidth}
          opacity={0.5}
        />
        {/* Animated foreground arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute text-center">
        <span className="block text-5xl font-bold tabular-nums text-clarity-ink">
          {animatedScore}
        </span>
        <span className="text-sm font-medium text-clarity-muted">{label}</span>
      </div>
    </div>
  );
}
