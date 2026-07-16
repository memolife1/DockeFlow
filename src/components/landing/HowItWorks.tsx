import { MessageSquare, Palette, Download } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { SmartImage } from "./SmartImage";

const STEPS = [
  {
    Icon: MessageSquare,
    title: "Describe your deck",
    body: "Type a topic or paste your notes. Add your audience, tone, and how many slides you need.",
    image: "/assets/screen-wizard-step1.png",
    imageLabel: "Wizard screenshot",
  },
  {
    Icon: Palette,
    title: "Choose your style",
    body: "Pick from 16 professional themes or upload your company's PowerPoint to extract your exact brand colors.",
    image: "/assets/screen-templates.png",
    imageLabel: "Templates screenshot",
  },
  {
    Icon: Download,
    title: "Download and present",
    body: "Export as PowerPoint (.pptx), PDF, or share a live link. Your slides are ready to open in PowerPoint and fully editable.",
    image: "/assets/screen-export.png",
    imageLabel: "Export screenshot",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-5 py-24 md:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-[1100px]">
        <FadeIn>
          <p className="lp-eyebrow">How it works</p>
          <h2 className="mt-4 max-w-xl text-3xl md:text-5xl" style={{ color: "var(--ink)" }}>
            Three steps from idea to presentation.
          </h2>
        </FadeIn>

        {/* Horizontal timeline: a thin line runs behind the three icons. */}
        <div className="relative mt-16">
          <div
            className="absolute left-0 right-0 top-[11px] hidden h-px md:block"
            style={{ background: "var(--line)" }}
          />
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <FadeIn key={step.title} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex flex-col">
                  <span
                    className="relative z-10 inline-flex w-fit pr-3"
                    style={{ background: "var(--bg)", color: "var(--ink-muted)" }}
                  >
                    <step.Icon size={22} strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-5 text-lg font-bold" style={{ color: "var(--ink)" }}>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm" style={{ color: "var(--ink-muted)" }}>
                    {step.body}
                  </p>
                  <div
                    className="mt-5 w-full overflow-hidden rounded-lg"
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
