import { motion } from "framer-motion";
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

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col px-5 sm:px-8">
      {/* Navbar */}
      <motion.nav
        {...rise(0)}
        className="mx-auto flex w-full max-w-6xl items-center justify-between py-6"
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
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-8">
        <motion.h1
          {...rise(0.15)}
          className="font-display font-bold uppercase leading-[0.95] text-ink"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", fontWeight: 700 }}
        >
          Turn rough notes into decks that{" "}
          <span className="text-cobalt">look designed.</span>
        </motion.h1>

        {/* Hero visual: transformation split with the diagonal-cut signature */}
        <motion.div {...rise(0.3)} className="mt-10 sm:mt-12">
          <HeroSplit />
        </motion.div>

        <motion.p
          {...rise(0.45)}
          className="mt-9 max-w-md text-base text-ink/70 sm:text-lg"
        >
          Paste your notes, pick a template, get a deck in minutes.
        </motion.p>

        <motion.div {...rise(0.55)} className="mt-6">
          <PillButton href="#" variant="primary">
            Create a presentation
            <ArrowRight size={15} strokeWidth={2.5} />
          </PillButton>
        </motion.div>
      </div>
    </section>
  );
}

function HeroSplit() {
  return (
    <div className="relative grid grid-cols-1 gap-4 overflow-hidden rounded-3xl border border-ink/10 bg-white p-4 shadow-[0_20px_60px_-30px_rgba(23,23,23,0.35)] sm:grid-cols-2 sm:gap-0 sm:p-0">
      {/* Left — rough notes */}
      <div className="flex flex-col rounded-2xl bg-paper p-6 sm:rounded-none sm:p-8">
        <MockLabel>Rough notes</MockLabel>
        <div className="mt-5 flex flex-col gap-3">
          {[88, 64, 95, 47, 79, 58].map((w, i) => (
            <div
              key={i}
              className="rounded-full bg-ink/15"
              style={{
                width: `${w}%`,
                height: 7,
                marginLeft: i % 2 ? 10 : 0,
                opacity: 0.5 + (i % 3) * 0.15,
              }}
            />
          ))}
          <div className="mt-1 h-7 w-24 rounded-md border border-dashed border-ink/25" />
        </div>
      </div>

      {/* Center diagonal-cut divider (signature) */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-[64px] -translate-x-1/2 sm:block">
        <DiagonalCut
          angle={14}
          className="h-full w-full"
          style={{ height: "100%" }}
        />
      </div>
      {/* Mobile divider */}
      <div className="relative h-6 w-full sm:hidden">
        <DiagonalCut angle={40} className="h-full w-full" style={{ height: "100%" }} />
      </div>

      {/* Right — finished deck (extra left pad on desktop to clear the divider) */}
      <div className="flex flex-col rounded-2xl bg-white p-6 sm:rounded-none sm:p-8 sm:pl-14">
        <MockLabel>Finished deck</MockLabel>
        <div className="mt-5 flex flex-1 flex-col">
          <div className="h-4 w-2/3 rounded-md bg-cobalt" />
          <div className="mt-2 h-2.5 w-2/5 rounded-md bg-ink/15" />
          <div className="mt-5 flex flex-1 gap-4">
            <div className="flex flex-1 flex-col gap-2.5 pt-1">
              {[95, 80, 88, 70].map((w, i) => (
                <div
                  key={i}
                  className="rounded-full bg-ink/10"
                  style={{ width: `${w}%`, height: 6 }}
                />
              ))}
            </div>
            <div className="flex flex-1 items-end gap-1.5 rounded-lg border border-ink/10 bg-paper p-3">
              {[45, 70, 55, 90, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-cobalt"
                  style={{ height: `${h}%`, opacity: 0.4 + i / 10 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MockLabel({ children }: { children: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">
      {children}
    </span>
  );
}
