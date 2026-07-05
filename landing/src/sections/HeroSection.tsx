import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PillButton } from "../components/PillButton";
import { DiagonalCut } from "../components/DiagonalCut";

const NAV_LINKS = ["How it works", "Templates", "Pricing"];

// Local FadeIn variants so the hero can use exact delays without re-triggering
// on view (hero is above the fold; animate on mount).
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const },
});

// Headline split into words so each can slide up and resolve from blur.
const HEADLINE: { t: string; cobalt?: boolean }[] = [
  { t: "Turn" },
  { t: "rough" },
  { t: "notes" },
  { t: "into" },
  { t: "decks" },
  { t: "that" },
  { t: "look", cobalt: true },
  { t: "designed.", cobalt: true },
];

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Navbar (unchanged) */}
      <motion.nav
        {...rise(0)}
        className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6 sm:px-8"
      >
        <span className="font-display text-lg font-bold tracking-tight text-ink">
          Decke<span className="text-cobalt">Flow</span>
        </span>
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l}
              href="#"
              className="text-[11px] font-medium uppercase tracking-widest text-ink transition-opacity duration-200 hover:opacity-70"
            >
              {l}
            </a>
          ))}
          <a
            href="#"
            className="text-[11px] font-medium uppercase tracking-widest text-ink transition-opacity duration-200 hover:opacity-70"
          >
            Log in
          </a>
          <a
            href="#"
            className="rounded-full bg-cobalt px-5 py-2.5 text-[11px] font-semibold uppercase tracking-widest text-white transition-opacity duration-200 hover:opacity-70"
          >
            Start free
          </a>
        </div>
        {/* Mobile: just the pill */}
        <a
          href="#"
          className="rounded-full bg-cobalt px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-white md:hidden"
        >
          Start free
        </a>
      </motion.nav>

      {/* Body */}
      <div className="flex flex-1 flex-col justify-center gap-4 py-4 sm:gap-5">
        {/* Headline — word-by-word slide + blur-to-focus */}
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <h1
            className="flex flex-wrap font-display font-bold uppercase leading-[0.88] text-ink"
            style={{ fontSize: "clamp(2.75rem, 9vw, 6.5rem)", columnGap: "0.26em" }}
          >
            {HEADLINE.map((w, i) => (
              <motion.span
                key={i}
                className={w.cobalt ? "text-cobalt" : undefined}
                style={{ display: "inline-block" }}
                initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{
                  delay: 0.1 + i * 0.08,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {w.t}
              </motion.span>
            ))}
          </h1>
        </div>

        {/* Hero visual: the diagonal cut is now the full-width main gesture */}
        <motion.div {...rise(0.75)} className="w-full">
          <HeroSplit />
        </motion.div>

        {/* Supporting line + CTA (copy unchanged) */}
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
          <motion.p
            {...rise(0.9)}
            className="max-w-md text-base text-ink/70 sm:text-lg"
          >
            Paste your notes, pick a template, get a deck in minutes.
          </motion.p>

          <motion.div {...rise(1.0)} className="mt-6">
            <MagneticCTA />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Full-bleed transformation split. The Cobalt/Coral diagonal cut runs
 * edge-to-edge across the viewport; the two mockups sit on the page
 * background on either side of it — no containing card.
 */
function HeroSplit() {
  return (
    <div
      className="relative w-full"
      style={{ height: "clamp(240px, 30vh, 360px)" }}
    >
      {/* The gesture: an edge-to-edge diagonal slash. */}
      <div className="pointer-events-none absolute inset-0 flex items-center overflow-hidden">
        <div
          className="relative w-[130%] -translate-x-[6%]"
          style={{ transform: "rotate(-9deg)" }}
        >
          <DiagonalCut
            angle={5}
            className="w-full"
            style={{ height: "clamp(78px, 12vh, 118px)" }}
          />
        </div>
      </div>

      {/* Mockups, aligned to the content column but floating on the page. */}
      <div className="relative mx-auto h-full max-w-6xl px-5 sm:px-8">
        <RoughNotes />
        <FinishedDeck />
      </div>
    </div>
  );
}

function RoughNotes() {
  // Uneven lines in varying ink tones; one line tilted; caret on the last.
  const lines = [
    { w: 82, o: 0.34 },
    { w: 61, o: 0.2, rot: -1 },
    { w: 92, o: 0.4 },
    { w: 48, o: 0.16 },
    { w: 70, o: 0.28 },
  ];
  return (
    <div className="absolute left-5 top-[2%] w-[46%] max-w-[380px] sm:left-8 sm:top-[6%]">
      <MockLabel>Rough notes</MockLabel>
      <div className="mt-5 flex flex-col gap-3.5">
        {lines.map((l, i) => (
          <div
            key={i}
            className="rounded-full"
            style={{
              width: `${l.w}%`,
              height: 9,
              background: `rgba(23,23,23,${l.o})`,
              transform: l.rot ? `rotate(${l.rot}deg)` : undefined,
            }}
          />
        ))}
        {/* last line + blinking caret */}
        <div className="flex items-center gap-1.5">
          <div
            className="rounded-full"
            style={{ width: "38%", height: 9, background: "rgba(23,23,23,0.24)" }}
          />
          <span
            className="dckf-cursor inline-block rounded-[1px] bg-ink"
            style={{ width: 2, height: 16 }}
          />
        </div>
      </div>
    </div>
  );
}

function FinishedDeck() {
  return (
    <div className="absolute bottom-[2%] right-5 w-[50%] max-w-[440px] sm:bottom-[4%] sm:right-8">
      <div className="mb-3">
        <MockLabel>Finished deck</MockLabel>
      </div>
      {/* Continuous, very subtle float — a small sign of life. */}
      <motion.div
        animate={{ y: [-4, 4] }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="rounded-2xl bg-white p-6 sm:p-7"
        style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
      >
        {/* bold Cobalt headline bar */}
        <div className="h-4 w-2/3 rounded-md bg-cobalt sm:h-5" />
        <div className="mt-3 h-2.5 w-2/5 rounded-md bg-ink/15" />

        <div className="mt-6 flex gap-5">
          {/* body lines */}
          <div className="flex flex-1 flex-col gap-3 pt-1">
            {[96, 82, 68].map((w, i) => (
              <div
                key={i}
                className="rounded-full bg-ink/10"
                style={{ width: `${w}%`, height: 7 }}
              />
            ))}
          </div>
          {/* bar chart — Cobalt-tint gradient bars */}
          <div className="flex flex-1 items-end gap-2">
            {[46, 72, 58, 92, 76].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[3px]"
                style={{
                  height: `${h}%`,
                  minHeight: 10,
                  background:
                    "linear-gradient(180deg, #2B4EFF 0%, rgba(43,78,255,0.35) 100%)",
                }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Primary CTA that leans toward the cursor when it's within ~80px, using a
 * spring so it eases in and releases smoothly. Copy is unchanged.
 */
function MagneticCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 160, damping: 14, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 160, damping: 14, mass: 0.1 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const radius = Math.max(r.width, r.height) / 2 + 80;
      if (Math.hypot(dx, dy) < radius) {
        x.set(dx * 0.35);
        y.set(dy * 0.35);
      } else {
        x.set(0);
        y.set(0);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY, display: "inline-block" }}
    >
      <PillButton href="#" variant="primary">
        Create a presentation
        <ArrowRight size={15} strokeWidth={2.5} />
      </PillButton>
    </motion.div>
  );
}

function MockLabel({ children }: { children: string }) {
  // Small chip backing keeps the label legible whether it sits on the paper
  // background or on the Cobalt diagonal band.
  return (
    <span className="inline-block rounded-full bg-paper/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/55 backdrop-blur-sm">
      {children}
    </span>
  );
}
