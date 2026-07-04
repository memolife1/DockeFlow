import Link from "next/link";
import { cn } from "@/lib/utils";

// Wordmark: a small stacked-slides glyph + "DeckeFlow".
export function Logo({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <span className="relative flex h-7 w-7 items-center justify-center">
        <span className="absolute inset-0 rounded-[7px] border border-line-strong bg-paper" />
        <span className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-[7px] bg-accent" />
        <span className="relative flex h-7 w-7 items-center justify-center rounded-[7px] border border-ink/10 bg-ink text-[13px] font-bold text-white">
          D
        </span>
      </span>
      {!compact && (
        <span className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
          Decke<span className="text-accent">Flow</span>
        </span>
      )}
    </Link>
  );
}
