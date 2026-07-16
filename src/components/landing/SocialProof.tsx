import { FadeIn } from "./FadeIn";

const TESTIMONIALS = [
  {
    quote:
      "I showed a colleague a deck I made in 8 minutes and they asked which agency designed it. That was the moment I knew DeckeFlow was different.",
    name: "M.A., Strategy Manager",
    detail: "Financial services, Dubai",
  },
  {
    quote:
      "We use it for every client proposal now. Upload the client's PowerPoint, type the brief, and we have a branded starting point in minutes instead of hours.",
    name: "S.K., Business Development Lead",
    detail: "Corporate events, Abu Dhabi",
  },
];

// Placeholder quotes — swap for real tester feedback before launch.
export function SocialProof() {
  return (
    <section className="px-5 py-24 md:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-[720px]">
        <FadeIn>
          <h2 className="text-3xl md:text-5xl" style={{ color: "var(--ink)" }}>
            Trusted by professionals across industries.
          </h2>
        </FadeIn>

        <div className="mt-16 space-y-20">
          {TESTIMONIALS.map((t, i) => (
            <FadeIn key={t.name} style={{ transitionDelay: `${i * 80}ms` }}>
              <figure>
                <span
                  aria-hidden
                  className="lp-display block text-6xl leading-none"
                  style={{ color: "var(--accent)" }}
                >
                  &ldquo;
                </span>
                <blockquote
                  className="mt-2 text-xl leading-relaxed md:text-2xl"
                  style={{ color: "var(--ink)" }}
                >
                  {t.quote}
                </blockquote>
                <figcaption className="mt-6 text-right">
                  <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                    — {t.name}
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
                    {t.detail}
                  </p>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
