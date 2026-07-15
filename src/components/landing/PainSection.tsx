import { FadeIn } from "./FadeIn";
import { SmartImage } from "./SmartImage";
import { Icon } from "./icons";

const PAIN_CARDS: { icon: "clock" | "palette" | "zap"; text: string }[] = [
  { icon: "clock", text: "You spend 3-4 hours on a deck that still looks generic." },
  { icon: "palette", text: "Your slides never match your brand. Every deck starts from scratch." },
  { icon: "zap", text: "You're scrambling the night before every important meeting." },
];

export function PainSection() {
  return (
    <section className="px-5 py-24 md:px-8" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto max-w-[1100px] text-center">
        <FadeIn>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--ink-light)" }}>
            Sound familiar?
          </p>
          <h2 className="lp-display mx-auto mt-3 max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Building a presentation shouldn&apos;t cost you half a day.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {PAIN_CARDS.map((card, i) => (
            <FadeIn
              key={card.text}
              className="text-left"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div
                className="h-full rounded-xl p-6"
                style={{ background: "var(--surface-dark)", border: "1px solid var(--line-dark)" }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ background: "rgba(37,99,235,0.15)", color: "var(--accent)" }}
                >
                  <Icon name={card.icon} size={20} />
                </div>
                <p className="text-[15px] leading-relaxed text-white">{card.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-16">
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
          <p className="mx-auto mt-4 max-w-2xl text-sm" style={{ color: "var(--ink-light)" }}>
            ↑ The left is how most presentations start. The right is what DeckeFlow produces — in
            under 10 minutes.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
