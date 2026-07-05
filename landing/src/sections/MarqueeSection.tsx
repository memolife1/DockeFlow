import { useEffect, useRef, useState } from "react";
import { TEMPLATES } from "../data/templates";
import { SlideMock } from "../components/SlideMock";

const CARD_W = 320;
const GAP = 24;

const ROW1 = [TEMPLATES[0], TEMPLATES[1], TEMPLATES[2]];
const ROW2 = [TEMPLATES[3], TEMPLATES[4], TEMPLATES[5]];

export function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const sectionTop = el.offsetTop;
      // Spec formula: parallax offset from the section's position on screen.
      const next = (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      setOffset(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Baseline shifts each row to show its middle (of three) copies, so the
  // tripled content always covers the viewport as it slides either way.
  const baseline = -(ROW1.length * (CARD_W + GAP));

  return (
    <section ref={sectionRef} className="overflow-hidden py-16 sm:py-24">
      <div className="mx-auto mb-10 w-full max-w-6xl px-5 sm:px-8">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">
          Six built-in styles
        </span>
      </div>

      <div className="flex flex-col gap-6">
        {/* Row 1 — moves right on scroll */}
        <Row
          templates={ROW1}
          transform={`translateX(${baseline + offset}px)`}
        />
        {/* Row 2 — moves left on scroll */}
        <Row
          templates={ROW2}
          transform={`translateX(${baseline - offset}px)`}
        />
      </div>
    </section>
  );
}

function Row({
  templates,
  transform,
}: {
  templates: typeof TEMPLATES;
  transform: string;
}) {
  // Triple for a seamless run.
  const cards = [...templates, ...templates, ...templates];
  return (
    <div className="no-scrollbar flex" style={{ gap: GAP, transform, willChange: "transform" }}>
      {cards.map((t, i) => (
        <div
          key={i}
          className="shrink-0 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_12px_40px_-24px_rgba(23,23,23,0.4)]"
          style={{ width: CARD_W, height: 200 }}
        >
          <SlideMock template={t} variant="card" />
        </div>
      ))}
    </div>
  );
}
