import type { ReactNode } from "react";

/**
 * Rounded-full button. Primary = the one place the Cobalt→Coral gradient
 * (and thus Coral) is allowed. Ghost = transparent with a 2px border in the
 * current section's foreground color, passed via `borderColor`.
 */
export function PillButton({
  children,
  variant = "primary",
  borderColor = "#171717",
  href = "#",
  className = "",
}: {
  children: ReactNode;
  variant?: "primary" | "ghost";
  borderColor?: string;
  href?: string;
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-xs font-semibold uppercase tracking-widest transition-all duration-200";

  if (variant === "primary") {
    return (
      <a
        href={href}
        className={`${base} cta-gradient text-white shadow-[0_10px_30px_-8px_rgba(43,78,255,0.5)] hover:shadow-[0_14px_40px_-8px_rgba(255,107,94,0.55)] hover:-translate-y-0.5 ${className}`}
      >
        {children}
      </a>
    );
  }

  return (
    <a
      href={href}
      className={`${base} border-2 bg-transparent hover:opacity-70 ${className}`}
      style={{ borderColor, color: borderColor }}
    >
      {children}
    </a>
  );
}
