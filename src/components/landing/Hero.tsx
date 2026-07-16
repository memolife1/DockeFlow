import Link from "next/link";
import { SmartImage } from "./SmartImage";

export function Hero() {
  return (
    <section
      className="flex min-h-[90vh] flex-col items-center justify-center px-5 pb-16 pt-14 text-center md:px-8"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <span
          className="lp-eyebrow inline-flex items-center rounded-full px-4 py-2"
          style={{ border: "1px solid var(--line)" }}
        >
          Presentation builder
        </span>

        <h1 className="text-[36px] md:text-[72px]" style={{ color: "var(--ink)" }}>
          Your messy notes.
          <br />
          <span style={{ color: "var(--accent)" }}>Boardroom-ready</span>
          <br />
          in 8 minutes.
        </h1>

        <p className="max-w-2xl text-lg md:text-xl" style={{ color: "var(--ink-muted)" }}>
          DeckeFlow turns your raw ideas, bullet points, and rough notes into executive-quality
          presentations — with your brand, your colors, your language. No design skills required.
        </p>

        <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full px-7 py-4 text-base font-bold text-white"
            style={{ background: "var(--accent)" }}
          >
            Start free — no credit card
          </Link>
          <a href="#how-it-works" className="text-base font-semibold" style={{ color: "var(--ink-muted)" }}>
            See how it works ↓
          </a>
        </div>

        <div className="mt-8 flex items-center gap-8 sm:gap-14">
          {[
            { value: "8 min", label: "average time to build a deck" },
            { value: "20+", label: "professional layouts" },
            { value: "5", label: "languages supported" },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <span className="lp-display text-2xl md:text-3xl" style={{ color: "var(--ink)" }}>
                {stat.value}
              </span>
              <span className="max-w-[110px] text-xs" style={{ color: "var(--ink-light)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-14 w-full max-w-[960px] px-2">
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
            alt="The DeckeFlow editor"
            label="DeckeFlow editor screenshot"
            width={1440}
            height={900}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
