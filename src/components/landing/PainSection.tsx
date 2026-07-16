import { FadeIn } from "./FadeIn";
import { SmartImage } from "./SmartImage";

export function PainSection() {
  return (
    <section className="px-5 py-24 md:px-8" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto max-w-[760px]">
        <FadeIn>
          <p className="lp-eyebrow" style={{ color: "var(--ink-light)" }}>
            Sound familiar?
          </p>
          <h2 className="mt-4 text-3xl text-white md:text-5xl">
            Building a presentation shouldn&apos;t cost you half a day.
          </h2>
          <p className="mt-8 text-lg" style={{ color: "var(--ink-light)" }}>
            Most professionals spend 3–4 hours on a presentation that still looks like it came
            from a free template. The content is there. The argument is solid. But the deck
            doesn&apos;t match.
          </p>

          <blockquote
            className="lp-display my-12 text-2xl leading-snug md:text-4xl"
            style={{ color: "var(--accent)" }}
          >
            &ldquo;The deck looks like you didn&apos;t care — even when you spent all day
            on it.&rdquo;
          </blockquote>

          <p className="text-lg font-semibold text-white">
            That&apos;s the problem DeckeFlow solves.
          </p>
        </FadeIn>
      </div>

      <div className="mx-auto mt-16 max-w-[1100px]">
        <FadeIn>
          <div className="overflow-hidden rounded-2xl" style={{ border: "1px solid var(--line-dark)" }}>
            <SmartImage
              src="/assets/before-after-1.jpg"
              alt="Before and after: rough notes turned into a DeckeFlow presentation"
              label="Before / after — before-after-1.jpg"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
          </div>
          <p className="mt-4 max-w-2xl text-sm" style={{ color: "var(--ink-light)" }}>
            ↑ The left is how most presentations start. The right is what DeckeFlow produces — in
            under 10 minutes.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
