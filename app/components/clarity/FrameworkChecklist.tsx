import type { StructureBreakdown, WhatMode } from "@/lib/types/what";

interface StructureChecklistProps {
  breakdown: StructureBreakdown;
  mode: WhatMode;
}

const WORK_ITEMS: { key: string; label: string }[] = [
  { key: "clear_position", label: "Stated a clear position" },
  { key: "context_stakes", label: "Explained context & stakes" },
  { key: "evidence", label: "Provided evidence or example" },
  { key: "action_recommendation", label: "Gave an action or recommendation" },
];

const SPOT_ITEMS: { key: string; label: string }[] = [
  { key: "clear_position", label: "Stated a clear position" },
  { key: "reasoning", label: "Explained reasoning" },
  { key: "concrete_example", label: "Gave a concrete example" },
  { key: "landing", label: "Landed it cleanly" },
];

export function StructureChecklist({ breakdown, mode }: StructureChecklistProps) {
  const items = mode === "work" ? WORK_ITEMS : SPOT_ITEMS;

  return (
    <ul className="space-y-2">
      {items.map(({ key, label }) => {
        const passed = (breakdown as unknown as Record<string, boolean>)[key] ?? false;
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
