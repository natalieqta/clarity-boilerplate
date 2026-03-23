import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

function scoreColor(score: number) {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  return "text-red-500";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-green-50 ring-green-200";
  if (score >= 60) return "bg-yellow-50 ring-yellow-200";
  return "bg-red-50 ring-red-200";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, module, score, created_at")
    .eq("user_email", user.email!)
    .order("created_at", { ascending: false })
    .limit(10);

  const rows = sessions ?? [];
  const firstName = user.email?.split("@")[0]?.split(".")[0] ?? "there";
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  // Stats
  const howSessions = rows.filter((r) => r.module === "how");
  const whatSessions = rows.filter((r) => r.module === "what");
  const avgScore =
    rows.length > 0
      ? Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length)
      : null;

  return (
    <main className="min-h-screen bg-clarity-bg">
      {/* Top bar */}
      <div className="border-b border-clarity-periwinkle bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="text-sm font-bold tracking-tight text-clarity-ink"
          >
            Clarity
          </Link>
          <span className="text-xs text-clarity-muted">{user.email}</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-clarity-ink sm:text-3xl">
            Hey {displayName} 👋
          </h1>
          <p className="mt-1 text-sm text-clarity-slate">
            Here&apos;s your practice snapshot.
          </p>
        </div>

        {/* Quick stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-clarity-periwinkle bg-white/70 p-5 text-center shadow-sm">
            <p className="text-3xl font-bold tabular-nums text-clarity-ink">
              {rows.length}
            </p>
            <p className="mt-1 text-xs font-medium text-clarity-muted">
              Sessions
            </p>
          </div>
          <div className="rounded-2xl border border-clarity-periwinkle bg-white/70 p-5 text-center shadow-sm">
            <p
              className={`text-3xl font-bold tabular-nums ${avgScore ? scoreColor(avgScore) : "text-clarity-muted"}`}
            >
              {avgScore ?? "—"}
            </p>
            <p className="mt-1 text-xs font-medium text-clarity-muted">
              Avg score
            </p>
          </div>
          <div className="rounded-2xl border border-clarity-periwinkle bg-white/70 p-5 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-clarity-ink">
                {howSessions.length}
              </span>
              <span className="rounded bg-clarity-lime/30 px-1.5 py-0.5 text-[10px] font-bold text-clarity-ink">
                HOW
              </span>
              <span className="text-sm font-bold text-clarity-ink">
                {whatSessions.length}
              </span>
              <span className="rounded bg-clarity-violet/10 px-1.5 py-0.5 text-[10px] font-bold text-clarity-violet">
                WHAT
              </span>
            </div>
            <p className="mt-2 text-xs font-medium text-clarity-muted">
              By module
            </p>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-8 flex gap-3">
          <Link
            href="/what"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-clarity-purple px-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-95"
          >
            💡 Message clarity
          </Link>
          <Link
            href="/test"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-white/80 px-4 text-sm font-semibold text-clarity-purple ring-1 ring-clarity-periwinkle transition hover:bg-clarity-mist"
          >
            🎙 Pronunciation test
          </Link>
        </div>

        {/* Session history */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-clarity-muted">
            Recent sessions
          </h2>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-clarity-muted/50 bg-clarity-mist/30 p-10 text-center">
              <p className="text-4xl">🎯</p>
              <p className="mt-3 text-sm font-medium text-clarity-ink">
                No sessions yet
              </p>
              <p className="mt-1 text-xs text-clarity-slate">
                Complete a test above to see your history here.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {rows.map((s) => {
                const date = new Date(s.created_at);
                const formatted = date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                });
                const isHow = s.module === "how";

                return (
                  <div
                    key={s.id}
                    className="flex items-center gap-4 rounded-xl border border-clarity-periwinkle bg-white/70 px-5 py-3.5 shadow-sm transition hover:shadow-md"
                  >
                    <span
                      className={`inline-flex w-14 justify-center rounded-lg px-2 py-1 text-xs font-bold uppercase ${
                        isHow
                          ? "bg-clarity-lime/30 text-clarity-ink"
                          : "bg-clarity-violet/10 text-clarity-violet"
                      }`}
                    >
                      {isHow ? "HOW" : "WHAT"}
                    </span>
                    <span className="flex-1 text-sm text-clarity-slate">
                      {formatted}
                    </span>
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold tabular-nums ring-1 ${scoreBg(s.score)} ${scoreColor(s.score)}`}
                    >
                      {s.score}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
