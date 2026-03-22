import type { StructureBreakdown } from "@/lib/types/what";

interface StructureChecklistProps {
  breakdown: StructureBreakdown;
}

const ITEMS: { key: keyof StructureBreakdown; label: string }[] = [
  { key: "clear_point", label: "Opened with a clear point" },
  { key: "reasoning", label: "Explained the reasoning" },
  { key: "proof", label: "Backed it up with proof" },
  { key: "landing", label: "Landed it cleanly" },
];

export function StructureChecklist({ breakdown }: StructureChecklistProps) {
  return (
    <ul className="space-y-2">
      {ITEMS.map(({ key, label }) => {
        const passed = breakdown[key] ?? false;
        return (
          <li key={key} className="flex items-center gap-2.5">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                passed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {passed ? "\u2713" : "\u2717"}
            </span>
            <span
              className={`text-sm ${
                passed ? "text-clarity-ink" : "text-clarity-muted"
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
