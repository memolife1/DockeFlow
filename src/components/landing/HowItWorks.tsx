import { FadeIn } from "./FadeIn";
import { SmartImage } from "./SmartImage";
import { Icon, type LpIconName } from "./icons";

const STEPS: { icon: LpIconName; title: string; body: string; image: string; imageLabel: string }[] = [
  {
    icon: "pen",
    title: "Describe your deck",
    body: "Type a topic or paste your notes. Add your audience, tone, and how many slides you need.",
    image: "/assets/screen-wizard-step1.png",
    imageLabel: "Step 1 screenshot",
  },
  {
    icon: "palette",
    title: "Choose your style",
    body: "Pick from 16 professional themes or upload your company's PowerPoint to extract your exact brand colors.",
    image: "/assets/screen-templates.png",
    imageLabel: "Step 2 screenshot",
  },
  {
    icon: "download",
    title: "Download and present",
    body: "Export as PowerPoint (.pptx), PDF, or share a live link. Your slides are ready to open in PowerPoint and fully editable.",
    image: "/assets/screen-export.png",
    imageLabel: "Step 3 screenshot",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-24 md:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-[1100px]">
        <FadeIn className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            How it works
          </p>
          <h2 className="lp-display mx-auto mt-3 max-w-xl text-3xl font-extrabold leading-tight md:text-5xl" style={{ color: "var(--ink)" }}>
            Three steps from idea to presentation.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <FadeIn key={step.title} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="flex flex-col items-center text-center md:items-start md:text-left">
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                >
                  <Icon name={step.icon} size={22} />
                </div>
                <h3 className="lp-display text-lg font-bold" style={{ color: "var(--ink)" }}>
                  Step {i + 1} — {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  {step.body}
                </p>
                <div
                  className="mt-4 w-full overflow-hidden rounded-lg shadow-md"
                  style={{ border: "1px solid var(--line)" }}
                >
                  <SmartImage
                    src={step.image}
                    alt={step.title}
                    label={step.imageLabel}
                    width={700}
                    height={460}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-16">
          <div className="lp-browser-frame">
            <div className="lp-browser-bar">
              <div className="lp-browser-dots">
                <span />
                <span />
                <span />
              </div>
              <div className="lp-browser-url" />
            </div>
            <SmartImage
              src="/assets/screen-editor.png"
              alt="The DeckeFlow editor showing a generated presentation"
              label="DeckeFlow editor screenshot"
              width={1440}
              height={900}
              className="h-auto w-full"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
