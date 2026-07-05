import { ArrowRight } from "lucide-react";
import { FadeIn } from "../components/FadeIn";
import { PillButton } from "../components/PillButton";
import { AnimatedText } from "../components/AnimatedText";
import { DiagonalCut } from "../components/DiagonalCut";

// Small diagonal-cut corner marks (the signature at reduced scale),
// alternating which color leads.
function CornerMark({
  position,
  lead,
}: {
  position: string;
  lead: "cobalt" | "coral";
}) {
  const color = lead === "cobalt" ? "#2B4EFF" : "#FF6B5E";
  const edge = lead === "cobalt" ? "#FF6B5E" : "#2B4EFF";
  return (
    <DiagonalCut
      angle={22}
      color={color}
      edge={edge}
      className={`absolute ${position}`}
      style={{ width: 54, height: 20 }}
    />
  );
}

export function ValueSection() {
  return (
    <section className="relative flex min-h-screen items-center justify-center px-5 py-24 sm:px-8">
      <CornerMark position="left-6 top-6 sm:left-12 sm:top-12" lead="cobalt" />
      <CornerMark position="right-6 top-6 sm:right-12 sm:top-12" lead="coral" />
      <CornerMark position="left-6 bottom-6 sm:left-12 sm:bottom-12" lead="coral" />
      <CornerMark position="right-6 bottom-6 sm:right-12 sm:bottom-12" lead="cobalt" />

      <div className="flex max-w-3xl flex-col items-center text-center">
        <FadeIn>
          <h2
            className="font-display font-bold uppercase leading-[0.95] text-ink"
            style={{ fontSize: "clamp(2.5rem, 10vw, 6rem)", fontWeight: 700 }}
          >
            Built for people who present for a living.
          </h2>
        </FadeIn>

        <AnimatedText
          className="mt-8 max-w-[560px] justify-center text-center text-lg font-medium leading-relaxed text-ink sm:text-xl"
          text="DeckeFlow gives you the speed of a template and the polish of a design team — without hiring one. Draft, refine, and ship client-ready decks in the time it used to take to outline them."
        />

        <FadeIn delay={0.15} className="mt-10">
          <PillButton href="#" variant="primary">
            Create a presentation
            <ArrowRight size={15} strokeWidth={2.5} />
          </PillButton>
        </FadeIn>
      </div>
    </section>
  );
}
