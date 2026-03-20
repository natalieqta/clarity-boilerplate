interface FillerHighlightProps {
  transcript: string;
  fillerWords: string[];
}

// Filler words to match (case-insensitive)
const FILLER_SET = new Set([
  "um", "uh", "like", "basically", "so", "you know",
  "kind of", "sort of", "right",
]);

export function FillerHighlight({ transcript, fillerWords }: FillerHighlightProps) {
  if (!transcript) return null;

  // Build a set of found fillers for highlighting
  const foundSet = new Set(fillerWords.map((w) => w.toLowerCase()));

  // Split by word boundaries but preserve whitespace and punctuation
  const tokens = transcript.split(/(\s+)/);

  return (
    <p className="text-sm leading-relaxed text-clarity-slate">
      {tokens.map((token, i) => {
        const clean = token.toLowerCase().replace(/[.,!?;:]/g, "").trim();
        if (foundSet.has(clean) || FILLER_SET.has(clean)) {
          return (
            <mark
              key={i}
              className="rounded bg-red-100 px-0.5 text-red-700"
            >
              {token}
            </mark>
          );
        }
        return <span key={i}>{token}</span>;
      })}
    </p>
  );
}
