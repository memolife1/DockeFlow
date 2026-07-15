import Link from "next/link";
import { FadeIn } from "./FadeIn";

export function TimeSavings() {
  return (
    <section
      className="px-5 py-20 text-center md:px-8"
      style={{ background: "linear-gradient(135deg, var(--accent), #1E40AF)" }}
    >
      <div className="mx-auto max-w-3xl">
        <FadeIn>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-10">
            <div className="flex flex-col items-center">
              <span
                className="lp-display text-5xl font-extrabold md:text-8xl"
                style={{ color: "rgba(255,255,255,0.45)", textDecoration: "line-through" }}
              >
                3.5 hours
              </span>
              <span className="mt-2 text-sm font-semibold text-white/70">Building a deck the old way</span>
            </div>
            <span className="text-2xl font-bold text-white/50">→</span>
            <div className="flex flex-col items-center">
              <span className="lp-display text-5xl font-extrabold text-white md:text-8xl">8 minutes</span>
              <span className="mt-2 text-sm font-semibold text-white">With DeckeFlow</span>
            </div>
          </div>

          <p className="mx-auto mt-10 max-w-xl text-lg text-white/85">
            That&apos;s the time back you get — every single presentation.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-block rounded-full px-7 py-4 text-base font-bold shadow-lg transition-transform hover:scale-[1.03]"
            style={{ background: "#ffffff", color: "var(--accent)" }}
          >
            Start saving time today →
          </Link>
        </FadeIn>
      </div>
    </section>
  );
}
