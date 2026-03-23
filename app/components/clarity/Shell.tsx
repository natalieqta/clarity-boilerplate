import Link from "next/link";

type ShellProps = {
  children: React.ReactNode;
  /** Narrow column for mobile-first practice flows */
  variant?: "default" | "narrow";
};

export function Shell({ children, variant = "default" }: ShellProps) {
  return (
    <div className="min-h-full flex flex-col bg-clarity-bg text-clarity-ink">
      <header className="sticky top-0 z-10 border-b border-clarity-periwinkle/80 bg-clarity-bg/95 backdrop-blur-sm">
        <div
          className={`mx-auto flex h-14 items-center justify-between px-4 sm:px-6 ${
            variant === "narrow" ? "max-w-lg" : "max-w-6xl"
          }`}
        >
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-clarity-ink"
          >
            Clarity
          </Link>
          <nav className="flex items-center gap-1 text-sm font-medium text-clarity-slate sm:gap-4">
            <Link
              href="/test"
              className="rounded-lg px-2 py-1.5 transition-colors hover:bg-clarity-mist hover:text-clarity-ink sm:px-3"
            >
              Pronunciation
            </Link>
            <Link
              href="/what"
              className="rounded-lg px-2 py-1.5 transition-colors hover:bg-clarity-mist hover:text-clarity-ink sm:px-3"
            >
              Message clarity
            </Link>
            <span className="hidden h-4 w-px bg-clarity-periwinkle sm:block" />
            <Link
              href="/dashboard"
              className="rounded-lg px-2 py-1.5 transition-colors hover:bg-clarity-mist hover:text-clarity-ink sm:px-3"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
