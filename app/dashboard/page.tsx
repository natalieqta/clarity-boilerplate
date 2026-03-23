import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10 sm:px-6">
      <div className="mb-8">
        <p className="text-sm font-medium text-clarity-purple">Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-clarity-ink sm:text-3xl">
          Your practice history
        </h1>
        <p className="mt-2 text-sm text-clarity-slate">
          Logged in as {user.email}
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-clarity-periwinkle bg-clarity-mist/50 p-8 text-center">
          <p className="text-sm text-clarity-slate">
            No sessions yet. Complete a pronunciation test or message clarity
            exercise to see your history here.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Link
              href="/what"
              className="inline-flex h-10 items-center rounded-xl bg-clarity-purple px-4 text-sm font-semibold text-white shadow-sm hover:brightness-95"
            >
              Message clarity
            </Link>
            <Link
              href="/test"
              className="inline-flex h-10 items-center rounded-xl bg-clarity-mist px-4 text-sm font-semibold text-clarity-purple ring-1 ring-clarity-periwinkle hover:bg-clarity-periwinkle"
            >
              Pronunciation test
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((s) => {
            const date = new Date(s.created_at);
            const formatted = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            });
            const isHow = s.module === "how";

            return (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-clarity-periwinkle bg-white/70 px-5 py-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold uppercase ${
                      isHow
                        ? "bg-clarity-lime/30 text-clarity-ink"
                        : "bg-clarity-violet/10 text-clarity-violet"
                    }`}
                  >
                    {isHow ? "HOW" : "WHAT"}
                  </span>
                  <span className="text-sm text-clarity-slate">{formatted}</span>
                </div>
                <span className="text-lg font-bold tabular-nums text-clarity-ink">
                  {s.score}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-clarity-purple hover:underline">
          &larr; Home
        </Link>
      </div>
    </main>
  );
}
