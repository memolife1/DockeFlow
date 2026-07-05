import { Upload, Sparkles, LayoutTemplate, Download, type LucideIcon } from "lucide-react";
import { FadeIn } from "../components/FadeIn";

interface Feature {
  icon: LucideIcon;
  name: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    icon: Upload,
    name: "Bring your own template",
    desc: "Match your existing deck's look — upload it and every slide follows.",
  },
  {
    icon: Sparkles,
    name: "AI structuring",
    desc: "Paste rough notes and get a clean, logical outline in seconds.",
  },
  {
    icon: LayoutTemplate,
    name: "6 ready-made styles",
    desc: "Professionally designed templates, not generic office defaults.",
  },
  {
    icon: Download,
    name: "Real .pptx export",
    desc: "A working PowerPoint file you can open and edit — not a screenshot.",
  },
];

export function FeaturesSection() {
  return (
    <section className="relative z-10 -mt-10 rounded-t-[60px] bg-white px-5 pb-24 pt-20 sm:px-8 sm:pt-28">
      <div className="mx-auto w-full max-w-3xl">
        <FadeIn>
          <h2
            className="mb-12 text-center font-display font-bold uppercase text-ink"
            style={{ fontSize: "clamp(2rem, 7vw, 3.5rem)", fontWeight: 700 }}
          >
            Features
          </h2>
        </FadeIn>

        <div>
          {FEATURES.map((f, i) => (
            <FadeIn key={f.name} delay={i * 0.1}>
              <div
                className="flex items-start gap-5 py-7"
                style={{
                  borderTop: "1px solid rgba(23,23,23,0.15)",
                  ...(i === FEATURES.length - 1
                    ? { borderBottom: "1px solid rgba(23,23,23,0.15)" }
                    : {}),
                }}
              >
                <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cobalt/10 text-cobalt">
                  <f.icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-ink sm:text-xl">
                    {f.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink/60 sm:text-base">{f.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
