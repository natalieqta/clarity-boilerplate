interface SubScore {
  label: string;
  score: number;
  maxScore: number;
}

interface SubScoreGridProps {
  scores: SubScore[];
}

function getBarColor(score: number, max: number): string {
  const pct = score / max;
  if (pct >= 0.8) return "bg-green-500";
  if (pct >= 0.6) return "bg-yellow-500";
  return "bg-red-400";
}

export function SubScoreGrid({ scores }: SubScoreGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {scores.map((s) => (
        <div
          key={s.label}
          className="rounded-lg bg-white/80 px-3 py-2.5 ring-1 ring-clarity-periwinkle"
        >
          <p className="text-xs text-clarity-muted">{s.label}</p>
          <p className="mt-0.5 text-lg font-bold tabular-nums text-clarity-ink">
            {Math.round(s.score)}
            <span className="text-xs font-normal text-clarity-muted">
              /{s.maxScore}
            </span>
          </p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-clarity-periwinkle/50">
            <div
              className={`h-1.5 rounded-full transition-all ${getBarColor(s.score, s.maxScore)}`}
              style={{ width: `${Math.min(100, (s.score / s.maxScore) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
