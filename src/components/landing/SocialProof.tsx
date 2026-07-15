import { FadeIn } from "./FadeIn";

const TESTIMONIALS = [
  {
    quote:
      "I showed a colleague a deck I made in 8 minutes and they asked which agency designed it. That was the moment I knew DeckeFlow was different.",
    attribution: "M.A., Strategy Manager",
  },
  {
    quote:
      "We use it for every client proposal now. Upload the client's PowerPoint, type the brief, and we have a branded starting point in minutes instead of hours.",
    attribution: "S.K., Business Development Lead",
  },
];

// Placeholder quotes — swap for real tester feedback before launch.
export function SocialProof() {
  return (
    <section className="px-5 py-24 md:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-[1100px]">
        <FadeIn className="text-center">
          <h2 className="lp-display mx-auto max-w-2xl text-3xl font-extrabold leading-tight md:text-5xl" style={{ color: "var(--ink)" }}>
            Trusted by professionals across industries.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.attribution} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="h-full rounded-xl p-8" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                <p className="text-[17px] italic leading-relaxed" style={{ color: "var(--ink)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-5 text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
                  — {t.attribution}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
