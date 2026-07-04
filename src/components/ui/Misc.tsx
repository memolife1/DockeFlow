import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "accent" | "green" | "amber";
  className?: string;
}) {
  const tones = {
    neutral: "bg-paper-sunk text-ink-soft border-line",
    accent: "bg-accent-soft text-accent-hover border-accent-ring",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin-slow",
        className,
      )}
      aria-hidden
    />
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("u-card", className)}>{children}</div>;
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="u-eyebrow">{children}</p>;
}

// Simple empty-state block used across dashboard/editor/library.
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start rounded-xl border border-dashed border-line-strong bg-paper-soft px-8 py-12 text-left">
      {icon && (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-paper text-ink-muted shadow-card">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-ink-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
