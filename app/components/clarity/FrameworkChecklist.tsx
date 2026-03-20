import type { FrameworkBreakdown } from "@/lib/types/what";

interface FrameworkChecklistProps {
  breakdown: FrameworkBreakdown;
}

const ITEMS: { key: keyof FrameworkBreakdown; label: string }[] = [
  { key: "point", label: "Made the point" },
  { key: "why_it_matters", label: "Explained why it matters" },
  { key: "support_reason", label: "Gave a support reason" },
  { key: "next_step", label: "Stated next step" },
];

export function FrameworkChecklist({ breakdown }: FrameworkChecklistProps) {
  return (
    <ul className="space-y-2">
      {ITEMS.map(({ key, label }) => {
        const passed = breakdown[key];
        return (
          <li key={key} className="flex items-center gap-2.5">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                passed
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {passed ? "✓" : "✗"}
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
