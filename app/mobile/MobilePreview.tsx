"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const routes = ["/", "/test", "/results", "/practice"] as const;

function normalizeScreen(raw: string | null): string {
  if (!raw) return "/practice";
  const decoded = decodeURIComponent(raw);
  return routes.includes(decoded as (typeof routes)[number])
    ? decoded
    : "/practice";
}

export function MobilePreview() {
  const searchParams = useSearchParams();
  const src = normalizeScreen(searchParams.get("screen"));

  return (
    <div className="min-h-full bg-gradient-to-b from-clarity-periwinkle to-clarity-mist py-10 px-4 text-clarity-ink">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Clarity — mobile layout preview
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-clarity-slate sm:text-base">
          Same routes as the web app, shown at phone width (390px). Pick a
          screen to load inside the frame.
        </p>
        <nav className="mt-6 flex flex-wrap justify-center gap-2">
          {routes.map((path) => {
            const label =
              path === "/"
                ? "Home"
                : path === "/test"
                  ? "Quick test"
                  : path === "/results"
                    ? "Results"
                    : "Practice";
            return (
              <Link
                key={path}
                href={`/mobile?screen=${encodeURIComponent(path)}`}
                className={`rounded-full px-4 py-2 text-sm font-medium shadow-sm ring-1 ring-clarity-periwinkle transition ${
                  src === path
                    ? "bg-clarity-purple text-white ring-clarity-purple"
                    : "bg-white/90 text-clarity-purple hover:bg-clarity-bg"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mx-auto mt-10 flex justify-center px-2">
        <div className="relative rounded-[2.75rem] border-[12px] border-clarity-navy bg-clarity-navy shadow-2xl">
          <div
            className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-clarity-navy"
            aria-hidden
          />
          <iframe
            key={src}
            title="Clarity mobile preview"
            className="block h-[min(82vh,820px)] w-[min(100vw-2rem,390px)] rounded-[2rem] bg-clarity-bg"
            src={src}
          />
        </div>
      </div>

      <p className="mx-auto mt-8 max-w-lg text-center text-xs text-clarity-muted">
        On a real phone, open any URL directly — components reflow without this
        chrome.
      </p>
    </div>
  );
}
