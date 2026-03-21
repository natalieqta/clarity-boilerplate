"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shell } from "../components/clarity/Shell";
import { PrimaryButton, GhostButton } from "../components/clarity/Buttons";
import { getRandomPrompt } from "@/lib/prompts";
import type { WhatMode, WhatPrompt } from "@/lib/types/what";

const MODES: { mode: WhatMode; title: string; description: string; icon: string }[] = [
  {
    mode: "work",
    title: "Work scenarios",
    description: "Project explanations, stakeholder questions, handling objections",
    icon: "💼",
  },
  {
    mode: "spot",
    title: "On-the-spot",
    description: "Opinion questions, hypotheticals, think-on-your-feet",
    icon: "⚡",
  },
];

export default function WhatPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<WhatMode | null>(null);
  const [prompt, setPrompt] = useState<WhatPrompt | null>(null);

  function handleModeSelect(mode: WhatMode) {
    setSelectedMode(mode);
    setPrompt(getRandomPrompt(mode));
  }

  function handleRegenerate() {
    if (selectedMode) {
      setPrompt(getRandomPrompt(selectedMode, prompt?.id));
    }
  }

  function handleStart() {
    if (prompt) {
      sessionStorage.setItem("clarity-what-prompt", JSON.stringify(prompt));
      router.push("/what/record");
    }
  }

  return (
    <Shell>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8">
          <p className="text-sm font-medium text-clarity-violet">Message clarity</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-clarity-ink sm:text-3xl">
            What to say
          </h1>
          <p className="mt-2 text-sm text-clarity-slate">
            Practice structuring your thoughts clearly. Speak your response and
            get scored on structure, speed to point, conciseness, and filler words.
          </p>
        </div>

        {/* Mode selection */}
        {!selectedMode && (
          <div className="grid gap-4 sm:grid-cols-2">
            {MODES.map(({ mode, title, description, icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeSelect(mode)}
                className="flex flex-col items-start gap-3 rounded-2xl border border-clarity-periwinkle bg-white/80 p-6 text-left shadow-sm transition hover:border-clarity-purple/40 hover:shadow-md"
              >
                <span className="text-3xl">{icon}</span>
                <div>
                  <h2 className="text-lg font-semibold text-clarity-ink">{title}</h2>
                  <p className="mt-1 text-sm text-clarity-slate">{description}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Prompt display */}
        {selectedMode && prompt && (
          <div className="flex flex-col gap-6">
            {/* Mode pill */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedMode(null);
                  setPrompt(null);
                }}
                className="text-sm text-clarity-purple hover:underline"
              >
                &larr; Change mode
              </button>
              <span className="rounded-full bg-clarity-violet/10 px-3 py-1 text-xs font-semibold text-clarity-violet">
                {selectedMode === "work" ? "Work scenario" : "On-the-spot"}
              </span>
            </div>

            {/* Prompt card */}
            <div className="rounded-2xl border border-clarity-periwinkle bg-white/80 p-6 shadow-sm sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-clarity-muted">
                Your prompt
              </p>
              <blockquote className="mt-4 border-l-4 border-clarity-purple pl-4 text-lg font-medium leading-relaxed text-clarity-ink sm:text-xl">
                {prompt.text}
              </blockquote>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <PrimaryButton type="button" onClick={handleStart}>
                  Start recording &rarr;
                </PrimaryButton>
                <GhostButton type="button" onClick={handleRegenerate}>
                  Different question
                </GhostButton>
              </div>
            </div>

            {/* Tips */}
            <div className="rounded-xl bg-clarity-mist/60 px-4 py-3">
              <p className="text-xs font-semibold text-clarity-navy">Tips for a strong response</p>
              {selectedMode === "work" ? (
                <ul className="mt-2 space-y-1 text-xs text-clarity-slate">
                  <li>1. State your position in the first 1-2 sentences</li>
                  <li>2. Give context and stakes — why does this matter?</li>
                  <li>3. Provide evidence or a supporting example</li>
                  <li>4. End with an action or recommendation</li>
                </ul>
              ) : (
                <ul className="mt-2 space-y-1 text-xs text-clarity-slate">
                  <li>1. State your position or answer up front</li>
                  <li>2. Explain your reasoning — the &ldquo;why&rdquo;</li>
                  <li>3. Give a concrete example or story</li>
                  <li>4. Land it — wrap up cleanly, don&apos;t trail off</li>
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </Shell>
  );
}
