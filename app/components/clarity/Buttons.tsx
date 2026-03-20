import Link from "next/link";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
};

export function PrimaryButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-12 items-center justify-center rounded-xl bg-[#7357FF] px-6 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7357FF] disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LimeButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-14 min-w-[8rem] items-center justify-center gap-2 rounded-full bg-clarity-lime px-8 text-sm font-bold text-clarity-ink shadow-md ring-2 ring-clarity-ink/10 transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clarity-ink ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-11 items-center justify-center rounded-xl border border-clarity-periwinkle bg-clarity-mist/50 px-5 text-sm font-medium text-clarity-navy transition hover:bg-clarity-periwinkle/80 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

type LinkButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
};

export function LinkButton({
  href,
  children,
  variant = "primary",
  className = "",
}: LinkButtonProps) {
  const base =
    variant === "primary"
      ? "inline-flex h-12 items-center justify-center rounded-xl bg-[#7357FF] px-6 text-sm font-semibold text-white no-underline shadow-sm transition hover:brightness-95 visited:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7357FF]"
      : "inline-flex h-12 items-center justify-center rounded-xl border-2 border-clarity-navy/25 bg-clarity-mist px-6 text-sm font-semibold text-clarity-ink shadow-sm transition hover:border-clarity-purple/40 hover:bg-clarity-periwinkle/90";
  return (
    <Link href={href} className={`${base} ${className}`}>
      {children}
    </Link>
  );
}
