"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "./FadeIn";

// A CSS-animated sequence standing in for a product demo video — no video
// file to host or buffer, always crisp at any resolution, and it loops
// indefinitely without needing a play button.

const DEMO_STEPS = [
  { id: "typing", duration: 2500, label: "Type your topic" },
  { id: "generating", duration: 2000, label: "AI generates your deck" },
  { id: "slides", duration: 3000, label: "Slides appear instantly" },
  { id: "export", duration: 1500, label: "Export in one click" },
] as const;

const DEMO_TEXT = "Q3 Sales Strategy Review for enterprise clients in the UAE market";
const SLIDE_COLORS = ["#0B1220", "#1E40AF", "#9B1D20", "#14532D", "#0B1220"];
const SLIDE_TITLES = [
  "Q3 Revenue Up 23% — But the Pipeline Underneath Is Deteriorating",
  "Three Markets Driving 80% of Growth",
  "The Risk: Enterprise Deals Stalling in Legal Review",
  "Five Actions to Close Before Q4 Locks In",
];

function DemoWidget() {
  const [step, setStep] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [visibleSlides, setVisibleSlides] = useState(0);
  const [showExport, setShowExport] = useState(false);

  // Reset transient per-step state the instant a new step begins, before
  // that step's own effect (below) starts driving it.
  useEffect(() => {
    setTypedText("");
    setVisibleSlides(0);
    setShowExport(false);
  }, [step]);

  // Step 0: typing animation.
  useEffect(() => {
    if (step !== 0) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i <= DEMO_TEXT.length) {
        setTypedText(DEMO_TEXT.slice(0, i));
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStep(1), 300);
      }
    }, 35);
    return () => clearInterval(interval);
  }, [step]);

  // Step 1: generating — a fixed pause, then move on to the slides.
  useEffect(() => {
    if (step !== 1) return;
    const t = setTimeout(() => setStep(2), DEMO_STEPS[1].duration);
    return () => clearTimeout(t);
  }, [step]);

  // Step 2: slides appearing one by one.
  useEffect(() => {
    if (step !== 2) return;
    let count = 0;
    const interval = setInterval(() => {
      if (count < SLIDE_TITLES.length) {
        setVisibleSlides(count + 1);
        count++;
      } else {
        clearInterval(interval);
        setTimeout(() => setStep(3), 400);
      }
    }, 500);
    return () => clearInterval(interval);
  }, [step]);

  // Step 3: export confirmation.
  useEffect(() => {
    if (step !== 3) return;
    const t = setTimeout(() => {
      setShowExport(true);
      setTimeout(() => setStep(0), 1200);
    }, 400);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div
      className="mx-auto max-w-[900px] overflow-hidden rounded-2xl"
      style={{ background: "#0B0F1A", boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)" }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: "#141929", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex gap-1.5">
          {["#FF5F57", "#FFBD2E", "#28CA41"].map((c) => (
            <div key={c} className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div
          className="mx-auto w-full max-w-[320px] rounded-md px-3 py-1 text-center text-xs"
          style={{ background: "rgba(255,255,255,0.06)", color: "#6B7280" }}
        >
          deckeflow.com
        </div>
      </div>

      {/* Demo content area */}
      <div className="relative px-6 py-10 sm:px-12" style={{ minHeight: 480 }}>
        {/* Step indicator */}
        <div className="mb-8 flex justify-center gap-2">
          {DEMO_STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full transition-colors duration-300"
                style={{ background: i === step ? "#2563EB" : "rgba(255,255,255,0.15)" }}
              />
              {i < DEMO_STEPS.length - 1 && (
                <div className="h-px w-6" style={{ background: "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          ))}
        </div>

        {/* Step label */}
        <p
          className="mb-8 text-center text-[13px] font-semibold uppercase tracking-[0.06em]"
          style={{ color: "#2563EB" }}
        >
          {DEMO_STEPS[step]?.label}
        </p>

        {/* STEP 0: Typing */}
        {step === 0 && (
          <div
            className="flex items-center gap-3 rounded-xl px-6 py-5"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <div className="h-5 w-5 shrink-0 rounded" style={{ background: "#2563EB" }} />
            <span className="text-base leading-relaxed" style={{ color: "#E5E7EB" }}>
              {typedText}
              <span
                className="ml-0.5 inline-block h-[18px] w-0.5 align-middle"
                style={{ background: "#2563EB", animation: "lp-demo-blink 0.8s step-end infinite" }}
              />
            </span>
          </div>
        )}

        {/* STEP 1: Generating */}
        {step === 1 && (
          <div className="py-10 text-center">
            <div className="mb-6 flex justify-center gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-2.5 w-2.5 rounded-full"
                  style={{
                    background: "#2563EB",
                    animation: `lp-demo-pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm" style={{ color: "#6B7280" }}>
              Analyzing your topic, building narrative structure...
            </p>
          </div>
        )}

        {/* STEP 2: Slides appearing */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {SLIDE_TITLES.map((title, i) => (
              <div
                key={i}
                className="flex aspect-video flex-col justify-end rounded-lg p-3 transition-all duration-[400ms]"
                style={{
                  background: SLIDE_COLORS[i % SLIDE_COLORS.length],
                  opacity: i < visibleSlides ? 1 : 0,
                  transform: i < visibleSlides ? "translateY(0)" : "translateY(12px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="mb-1.5 h-0.5 w-5" style={{ background: "#2563EB" }} />
                <p className="m-0 text-[9px] font-semibold leading-tight text-white">{title}</p>
              </div>
            ))}
          </div>
        )}

        {/* STEP 3: Export */}
        {step === 3 && (
          <div className="py-10 text-center">
            <div
              className="inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-base font-semibold text-white transition-colors duration-[400ms]"
              style={{
                background: showExport ? "#16A34A" : "#2563EB",
                boxShadow: "0 8px 24px rgba(37, 99, 235, 0.4)",
              }}
            >
              {showExport ? <>✓ Downloaded — presentation-q3-sales.pptx</> : <>↓ Export as PowerPoint</>}
            </div>
            <p className="mt-4 text-[13px]" style={{ color: "#6B7280" }}>
              Fully editable in PowerPoint. Real text, real shapes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnimatedDemo() {
  return (
    <section className="px-5 py-20 md:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-[960px]">
        <FadeIn>
          <p className="lp-eyebrow text-center">See it in action</p>
          <div className="mt-8">
            <DemoWidget />
          </div>
          <p className="mt-5 text-center text-sm" style={{ color: "var(--ink-muted)" }}>
            From topic to export in under 10 minutes — no design skills required.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
