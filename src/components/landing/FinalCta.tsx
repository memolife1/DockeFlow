import Link from "next/link";
import { FadeIn } from "./FadeIn";

export function FinalCta() {
  return (
    <section className="px-5 py-20 text-center md:px-8" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto max-w-xl">
        <FadeIn>
          <h2 className="lp-display text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Your next presentation is 8 minutes away.
          </h2>
          <p className="mt-4 text-lg" style={{ color: "var(--ink-light)" }}>
            Start free. No credit card required. Your first deck on us.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full px-7 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
              style={{ background: "var(--accent)" }}
            >
              Create your first deck →
            </Link>
            <Link
              href="/login"
              className="rounded-full px-7 py-4 text-base font-bold text-white"
              style={{ border: "1px solid rgba(255,255,255,0.3)" }}
            >
              Sign in
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
