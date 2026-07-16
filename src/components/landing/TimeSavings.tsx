import Link from "next/link";
import { FadeIn } from "./FadeIn";

export function TimeSavings() {
  return (
    <section className="px-5 py-20 md:px-8" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-[900px] text-center">
        <FadeIn>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:items-end sm:gap-14">
            <div className="flex flex-col items-center">
              <span
                className="lp-display text-5xl md:text-7xl"
                style={{ color: "var(--ink-light)", textDecoration: "line-through" }}
              >
                3.5 hours
              </span>
              <span className="mt-3 text-sm font-medium" style={{ color: "var(--ink-muted)" }}>
                Building a deck the old way
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="lp-display text-6xl md:text-8xl" style={{ color: "var(--ink)" }}>
                8 minutes
              </span>
              <span className="mt-3 text-sm font-semibold" style={{ color: "var(--ink)" }}>
                With DeckeFlow
              </span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-lg" style={{ color: "var(--ink-muted)" }}>
            That&apos;s the time back you get — every single presentation.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full px-7 py-4 text-base font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            Start saving time today →
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
