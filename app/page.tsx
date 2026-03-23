import Link from "next/link";
import { Shell } from "./components/clarity/Shell";

export default function Home() {
  return (
    <Shell>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-4 py-10 sm:px-6 lg:py-16">
        {/* Hero */}
        <section className="max-w-3xl space-y-4 animate-fade-in-up">
          <p className="text-sm font-semibold uppercase tracking-wider text-clarity-purple">
            Communication practice
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-clarity-ink sm:text-5xl">
            Sound confident in every demo — starting with clarity.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-clarity-slate">
            Practice how you say it and what you say — with instant AI feedback.
          </p>
        </section>

        {/* Two module cards */}
        <section className="grid gap-6 sm:grid-cols-2 animate-fade-in-up-delay-1">
          {/* WHAT card */}
          <Link
            href="/what"
            className="glass-card group flex flex-col justify-between p-6 transition hover:border-clarity-purple/40 hover:shadow-md sm:p-8"
          >
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-clarity-violet/10 text-xl">
                💡
              </span>
              <h2 className="mt-4 text-xl font-bold text-clarity-ink">
                WHAT you say
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-clarity-slate">
                Practice thinking on your feet. Respond to work scenarios and
                get scored on structure, speed to point, conciseness, and filler
                words.
              </p>
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-clarity-purple group-hover:underline">
                Try a scenario &rarr;
              </span>
            </div>
          </Link>

          {/* HOW card */}
          <Link
            href="/test"
            className="glass-card group flex flex-col justify-between p-6 transition hover:border-clarity-purple/40 hover:shadow-md sm:p-8"
          >
            <div>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-clarity-lime/30 text-xl">
                🎙
              </span>
              <h2 className="mt-4 text-xl font-bold text-clarity-ink">
                HOW you say it
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-clarity-slate">
                Perfect your pronunciation. Read sentences, get word-level
                scores, and drill specific sounds. For non-native speakers
                refining English and native speakers who need to enunciate.
              </p>
            </div>
            <div className="mt-6">
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-clarity-purple group-hover:underline">
                Start pronunciation test &rarr;
              </span>
            </div>
          </Link>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-2xl animate-fade-in-up-delay-2">
          <div className="glass-card p-6 sm:p-8">
            <h2 className="text-sm font-semibold text-clarity-navy">
              How it works
            </h2>
            <ol className="mt-4 space-y-4 text-sm leading-relaxed text-clarity-navy">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clarity-purple text-xs font-bold text-white">
                  1
                </span>
                <span>
                  <strong className="text-clarity-ink">Pick a module</strong> —
                  pronunciation (HOW) or message clarity (WHAT).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clarity-purple text-xs font-bold text-white">
                  2
                </span>
                <span>
                  <strong className="text-clarity-ink">Record yourself</strong>{" "}
                  — speak naturally, just like you would in a meeting.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-clarity-purple text-xs font-bold text-white">
                  3
                </span>
                <span>
                  <strong className="text-clarity-ink">
                    Get instant AI feedback
                  </strong>{" "}
                  — specific coaching, not generic tips.
                </span>
              </li>
            </ol>
          </div>
        </section>
      </main>
    </Shell>
  );
}
