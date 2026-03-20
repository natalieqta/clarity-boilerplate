interface ScoreCircleProps {
  score: number;
  label?: string;
}

export function ScoreCircle({ score, label = "Clarity score" }: ScoreCircleProps) {
  return (
    <div
      className="relative flex h-44 w-44 items-center justify-center rounded-full bg-clarity-mist ring-4 ring-clarity-purple/25"
      aria-label={`Score ${Math.round(score)} out of 100`}
    >
      <div className="text-center">
        <span className="block text-5xl font-bold tabular-nums text-clarity-ink">
          {Math.round(score)}
        </span>
        <span className="text-sm font-medium text-clarity-muted">{label}</span>
      </div>
    </div>
  );
}
