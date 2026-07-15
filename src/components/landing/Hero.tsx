import Link from "next/link";
import { SmartImage } from "./SmartImage";
import { Icon } from "./icons";

export function Hero() {
  return (
    <section
      className="flex min-h-[90vh] flex-col items-center justify-center px-5 pb-16 pt-14 text-center md:px-8"
      style={{ background: "var(--bg)" }}
    >
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-widest"
          style={{ background: "var(--accent-light)", color: "var(--accent)" }}
        >
          <Icon name="sparkles" size={14} />
          AI-powered presentation builder
        </span>

        <h1
          className="lp-display text-[36px] font-extrabold leading-[1.08] tracking-tight md:text-[72px]"
          style={{ color: "var(--ink)" }}
        >
          Your messy notes.
          <br />
          <span style={{ color: "var(--accent)", textDecoration: "underline", textDecorationColor: "var(--accent-light)", textDecorationThickness: "6px", textUnderlineOffset: "6px" }}>
            Boardroom-ready
          </span>
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
            className="rounded-full px-7 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
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
              <span className="lp-display text-2xl font-extrabold md:text-3xl" style={{ color: "var(--ink)" }}>
                {stat.value}
              </span>
              <span className="max-w-[110px] text-xs" style={{ color: "var(--ink-light)" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative mt-14 w-full max-w-[900px] px-2">
        <div className="overflow-hidden rounded-2xl shadow-2xl" style={{ boxShadow: "0 30px 80px -30px rgba(37,99,235,0.35)" }}>
          <SmartImage
            src="/assets/laptop-dark-1.png"
            alt="DeckeFlow editor shown on a laptop"
            label="Product screenshot — laptop-dark-1.png"
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
