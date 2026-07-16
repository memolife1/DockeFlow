"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FadeIn } from "./FadeIn";

const FAQS = [
  {
    q: "Do I need design skills to use DeckeFlow?",
    a: "None at all. You describe what you need in plain text — your topic, audience, and tone — and DeckeFlow handles the design. Every slide is designed automatically with professional layouts, typography, and spacing.",
  },
  {
    q: "Can I use my company's branding?",
    a: "Yes. Upload your company's PowerPoint template and DeckeFlow extracts your exact colors, fonts, and logo. Your generated decks will match your brand automatically. Available on Pro and Business plans.",
  },
  {
    q: "What formats can I export to?",
    a: "PowerPoint (.pptx), PDF, and shareable web link. The PowerPoint export is fully editable — real text and shapes, not screenshots. You can open it directly in PowerPoint and keep editing.",
  },
  {
    q: "What languages are supported?",
    a: "You can generate presentations in English, Arabic (with right-to-left layout), French, German, and Russian. The app interface is in English.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. There are no contracts or commitments. Cancel anytime from your account settings and you keep access until the end of your billing period.",
  },
  {
    q: "How is DeckeFlow different from Gamma or Beautiful.ai?",
    a: "DeckeFlow is built for business professionals and corporate teams, not general use. The AI generates real business arguments, not placeholder content. You get full PowerPoint export that stays editable, and full brand control including color extraction from your existing templates.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "var(--line)" }}>
      <button
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-[15px] font-semibold" style={{ color: "var(--ink)" }}>
          {q}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={1.75}
          className="shrink-0 transition-transform"
          style={{ color: "var(--ink-muted)", transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm leading-relaxed" style={{ color: "var(--ink-muted)" }}>
          {a}
        </p>
      )}
    </div>
  );
}

export function Faq() {
  return (
    <section className="px-5 py-20 md:px-8" style={{ background: "var(--surface)" }}>
      <div className="mx-auto max-w-[720px]">
        <FadeIn className="text-center">
          <h2 className="lp-display text-3xl font-extrabold" style={{ color: "var(--ink)" }}>
            Questions? Answered.
          </h2>
        </FadeIn>
        <FadeIn className="mt-10">
          {FAQS.map((f) => (
            <FaqItem key={f.q} q={f.q} a={f.a} />
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
