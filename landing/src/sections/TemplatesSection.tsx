import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TEMPLATES, type TemplateInfo } from "../data/templates";
import { SlideMock } from "../components/SlideMock";
import { DiagonalCut } from "../components/DiagonalCut";

export function TemplatesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const total = TEMPLATES.length;

  return (
    <section className="relative z-20 -mt-10 rounded-t-[60px] bg-ink px-5 pb-[10vh] pt-24 text-paper sm:px-8">
      <div className="mx-auto mb-16 flex w-full max-w-5xl items-center gap-4">
        <h2
          className="font-display font-bold uppercase text-paper"
          style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)", fontWeight: 700 }}
        >
          Templates
        </h2>
        {/* diagonal-cut signature as heading accent (not gradient text) */}
        <DiagonalCut angle={20} className="mt-2" style={{ width: 72, height: 26 }} />
      </div>

      <div ref={containerRef} className="mx-auto w-full max-w-5xl">
        {TEMPLATES.map((t, i) => {
          const targetScale = 1 - (total - 1 - i) * 0.03;
          return (
            <StackCard
              key={t.name}
              template={t}
              index={i}
              targetScale={targetScale}
              progress={scrollYProgress}
              total={total}
            />
          );
        })}
      </div>
    </section>
  );
}

function StackCard({
  template,
  index,
  targetScale,
  progress,
  total,
}: {
  template: TemplateInfo;
  index: number;
  targetScale: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  total: number;
}) {
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  return (
    <div
      className="sticky flex h-[85vh] items-center justify-center"
      style={{ top: index * 28 }}
    >
      <motion.div
        style={{ scale, top: index * 28 }}
        className="relative grid w-full grid-cols-1 gap-8 rounded-[60px] border-2 bg-ink p-8 sm:p-12 md:grid-cols-2 md:items-center"
      >
        {/* border color: cobalt at 30% (set via inline for exact alpha) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[60px] border-2"
          style={{ borderColor: "rgba(43,78,255,0.3)" }}
        />

        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/40">
            Template {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-3 font-display text-3xl font-bold uppercase leading-none text-paper sm:text-4xl">
            {template.name}
          </h3>
          <p className="mt-4 max-w-sm text-sm text-paper/60 sm:text-base">
            {template.description}
          </p>
          <div className="mt-7">
            <a
              href="#"
              className="inline-flex items-center rounded-full border-2 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-paper transition-opacity duration-200 hover:opacity-70"
              style={{ borderColor: "#FBFBF9" }}
            >
              Preview
            </a>
          </div>
        </div>

        {/* larger CSS mockup of this template */}
        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
          <div style={{ aspectRatio: "16 / 10" }}>
            <SlideMock template={template} variant="large" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
