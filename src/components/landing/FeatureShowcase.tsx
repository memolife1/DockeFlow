import { FadeIn } from "./FadeIn";
import { SmartImage } from "./SmartImage";

interface Feature {
  headline: string;
  body: string;
  image: string;
  imageLabel: string;
  badge?: string;
  imageSide: "left" | "right";
}

const FEATURES: Feature[] = [
  {
    headline: "Your brand. Applied to every slide automatically.",
    body: "Upload your company's PowerPoint template and DeckeFlow reads your exact colors, fonts, and logo. Every generated deck comes out looking like your design team built it.",
    image: "/assets/laptop-dark-2.jpg",
    imageLabel: "Brand extraction — laptop-dark-2.jpg",
    badge: "Pro & Business",
    imageSide: "right",
  },
  {
    headline: "Not filler text. Real arguments, real structure.",
    body: "Powered by Claude, every slide makes a specific claim. Headlines are assertions, not topics. Speaker notes tell you exactly what to say. This is consultant-level content, not a template filled with Lorem Ipsum.",
    image: "/assets/team-review.jpg",
    imageLabel: "Reviewing a generated deck — team-review.jpg",
    imageSide: "left",
  },
  {
    headline: "Generate in English, Arabic, French, German, or Russian.",
    body: "Working with international clients or a multilingual team? Choose your language before generating. Arabic decks are automatically right-to-left.",
    image: "/assets/before-after-2.jpg",
    imageLabel: "Multi-language — before-after-2.jpg",
    imageSide: "right",
  },
  {
    headline: "Every slide picks the right layout for its content.",
    body: "Stat cards for numbers. Timelines for processes. Funnels for sales data. Full-bleed images for events. The AI picks the layout that fits the content — not the same template for every slide.",
    image: "/assets/laptop-desk.jpg",
    imageLabel: "20+ layouts — laptop-desk.jpg",
    imageSide: "left",
  },
  {
    headline: "PPTX, PDF, or a shareable link. All in one click.",
    body: "Your exported PowerPoint is fully editable — real text, real shapes, real charts. Not screenshots. Open it in PowerPoint and keep editing. Or share a live preview link that works in any browser.",
    image: "/assets/before-after-3.jpg",
    imageLabel: "Export formats — before-after-3.jpg",
    imageSide: "right",
  },
  {
    headline: "Full design control when you need it.",
    body: "Change headline colors, background patterns, fonts, and accent colors per slide or across all slides at once. Add your logo as a watermark on every slide. It's your deck — fully customizable.",
    image: "/assets/before-after-1.jpg",
    imageLabel: "Per-slide design — before-after-1.jpg",
    imageSide: "left",
  },
];

function FeatureBlock({ feature, index }: { feature: Feature; index: number }) {
  const background = index % 2 === 0 ? "var(--bg)" : "var(--surface)";
  // Image always renders first in source order (stacks above text on
  // mobile); md:order-* repositions it left/right on desktop only.
  const imageOrder = feature.imageSide === "left" ? "md:order-1" : "md:order-2";
  const textOrder = feature.imageSide === "left" ? "md:order-2" : "md:order-1";
  return (
    <section className="px-5 py-16 md:px-8" style={{ background }}>
      <div className="mx-auto grid max-w-[1100px] grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        <FadeIn className={imageOrder}>
          <div className="overflow-hidden rounded-xl shadow-lg" style={{ border: "1px solid var(--line)" }}>
            <SmartImage
              src={feature.image}
              alt={feature.headline}
              label={feature.imageLabel}
              width={900}
              height={650}
              className="h-auto w-full"
            />
          </div>
        </FadeIn>
        <FadeIn className={textOrder}>
          {feature.badge && (
            <span
              className="mb-3 inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              {feature.badge}
            </span>
          )}
          <h3 className="lp-display text-2xl font-extrabold leading-tight md:text-3xl" style={{ color: "var(--ink)" }}>
            {feature.headline}
          </h3>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            {feature.body}
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

export function FeatureShowcase() {
  return (
    <>
      {FEATURES.map((feature, i) => (
        <FeatureBlock key={feature.headline} feature={feature} index={i} />
      ))}
    </>
  );
}
