import type { Template } from "@/lib/types";

// Fully-designed static example slides for the template picker. Each is a
// distinct layout + type treatment + sample content matching the template's
// "feel" — not a recolored copy of one wireframe. Sized with container-query
// units so the same design scales in the picker grid and larger contexts.

function Frame({
  children,
  background,
  color,
  serif,
}: {
  children: React.ReactNode;
  background: string;
  color: string;
  serif?: boolean;
}) {
  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden [container-type:inline-size]"
      style={{
        background,
        color,
        fontFamily: serif
          ? '"Iowan Old Style", Palatino, Georgia, serif'
          : '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
      }}
    >
      {children}
    </div>
  );
}

// 1) Editorial — warm serif, magazine-like company overview.
function Editorial({ accent }: { accent: string }) {
  return (
    <Frame background="#fbf7f1" color="#2b2622" serif>
      <div className="flex h-full flex-col px-[8%] py-[7%]">
        <span
          className="text-[2.3cqw] font-semibold uppercase tracking-[0.24em]"
          style={{ color: accent, fontFamily: '"Plus Jakarta Sans", sans-serif' }}
        >
          Company Overview
        </span>
        <h3 className="mt-[3%] text-[8.2cqw] font-semibold leading-[0.98] tracking-[-0.01em]">
          Building the modern studio.
        </h3>
        <div className="my-[4%] h-[0.5cqw] w-[16%]" style={{ background: accent }} />
        <div className="grid flex-1 grid-cols-2 gap-[6%] text-[2.7cqw] leading-[1.35] text-[#5c534b]">
          <p>
            A design-led practice shaping brands, products, and the stories that
            carry them to market.
          </p>
          <p>
            Sixty specialists across three studios, one standard for the work we
            put our name on.
          </p>
        </div>
        <span className="mt-[3%] text-[2.2cqw] tracking-wide text-[#8a7f75]">
          Northwind Studio — Est. 2019
        </span>
      </div>
    </Frame>
  );
}

// 2) Boardroom — formal, restrained quarterly review with a KPI row.
function Boardroom({ accent }: { accent: string }) {
  const kpis = [
    ["$4.2M", "Revenue", "▲ 12%"],
    ["38%", "Gross margin", "▲ 3pts"],
    ["1.9%", "Net churn", "▼ 0.4pts"],
  ];
  return (
    <Frame background="#ffffff" color="#14201b">
      <div className="flex h-full flex-col px-[7%] py-[6%]">
        <div className="flex items-center justify-between text-[2.2cqw] font-semibold uppercase tracking-[0.18em]">
          <span style={{ color: accent }}>Q4 Board Review</span>
          <span className="text-[#9aa3a0]">Confidential</span>
        </div>
        <div className="mt-[2.5%] h-px w-full" style={{ background: "#e3e7e5" }} />
        <h3 className="mt-[4%] text-[5.4cqw] font-bold tracking-[-0.01em]">
          Performance summary
        </h3>
        <div className="mt-auto grid grid-cols-3 gap-[5%]">
          {kpis.map(([n, l, d]) => (
            <div key={l} className="border-t-[0.4cqw] pt-[6%]" style={{ borderColor: accent }}>
              <div className="text-[6.2cqw] font-bold leading-none tracking-[-0.02em]">
                {n}
              </div>
              <div className="mt-[8%] text-[2.3cqw] text-[#5f6b66]">{l}</div>
              <div className="mt-[2%] text-[2.1cqw] font-semibold" style={{ color: accent }}>
                {d}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

// 3) Sales Motion — bold, high-contrast pitch with a solid accent "ask" block.
function SalesMotion({ accent }: { accent: string }) {
  return (
    <Frame background="#ffffff" color="#171310">
      <div className="flex h-full">
        <div className="flex flex-1 flex-col justify-center px-[8%] py-[7%]">
          <span
            className="text-[2.4cqw] font-extrabold uppercase tracking-[0.16em]"
            style={{ color: accent }}
          >
            The Pitch
          </span>
          <h3 className="mt-[4%] text-[9cqw] font-extrabold leading-[0.92] tracking-[-0.03em]">
            Close 30% more deals.
          </h3>
          <p className="mt-[5%] text-[2.7cqw] font-medium text-[#5b524d]">
            Same team. Same quarter. A repeatable motion.
          </p>
        </div>
        <div
          className="flex w-[34%] flex-col justify-center px-[7%] text-white"
          style={{ background: accent }}
        >
          <span className="text-[2.3cqw] font-bold uppercase tracking-[0.16em] opacity-80">
            The Ask
          </span>
          <div className="mt-[6%] text-[7cqw] font-extrabold leading-[0.95] tracking-[-0.02em]">
            $50K
          </div>
          <span className="mt-[4%] text-[2.4cqw] font-semibold opacity-90">
            per quarter
          </span>
        </div>
      </div>
    </Frame>
  );
}

// 4) Consulting Brief — analytical grid: numbered findings + recommendation.
function Consulting({ accent }: { accent: string }) {
  const findings = [
    ["01", "Pipeline concentrated in two accounts"],
    ["02", "Onboarding time 40% above target"],
    ["03", "Expansion revenue under-indexed"],
  ];
  return (
    <Frame background="#f6f7fb" color="#1b2231">
      <div className="flex h-full flex-col px-[7%] py-[6%]">
        <div className="flex items-baseline justify-between">
          <h3 className="text-[4cqw] font-bold tracking-[-0.01em]">
            Findings &amp; Recommendation
          </h3>
          <span className="text-[2.1cqw] font-semibold uppercase tracking-[0.14em] text-[#8b93a6]">
            Strategy Review
          </span>
        </div>
        <div className="mt-[4%] grid flex-1 grid-cols-[1.15fr_1fr] gap-[5%]">
          <div className="flex flex-col justify-between">
            {findings.map(([n, t]) => (
              <div key={n} className="flex items-start gap-[4%]">
                <span
                  className="text-[3cqw] font-bold tabular-nums"
                  style={{ color: accent }}
                >
                  {n}
                </span>
                <span className="text-[2.5cqw] leading-[1.25] text-[#454d5e]">{t}</span>
              </div>
            ))}
          </div>
          <div
            className="flex flex-col justify-center rounded-[1.2cqw] bg-white px-[8%] py-[6%]"
            style={{ borderLeft: `0.9cqw solid ${accent}` }}
          >
            <span
              className="text-[2.1cqw] font-bold uppercase tracking-[0.14em]"
              style={{ color: accent }}
            >
              Recommendation
            </span>
            <p className="mt-[6%] text-[2.6cqw] font-medium leading-[1.3]">
              Diversify pipeline and standardize onboarding within two quarters.
            </p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

// 5) Startup Update — light, airy metrics update with generous whitespace.
function StartupUpdate({ accent }: { accent: string }) {
  const metrics = [
    ["128%", "MRR growth"],
    ["3.4k", "Active teams"],
    ["42", "NPS"],
  ];
  return (
    <Frame background="#ffffff" color="#12211f">
      <div className="flex h-full flex-col px-[8%] py-[7.5%]">
        <span
          className="text-[2.3cqw] font-semibold uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          Monthly Update · June
        </span>
        <div className="flex flex-1 items-center">
          <div className="grid w-full grid-cols-3 gap-[6%]">
            {metrics.map(([n, l]) => (
              <div key={l}>
                <div className="text-[9cqw] font-light leading-none tracking-[-0.03em]">
                  {n}
                </div>
                <div className="mt-[10%] flex items-center gap-[6%]">
                  <span className="h-[0.5cqw] w-[18%]" style={{ background: accent }} />
                  <span className="text-[2.3cqw] text-[#5c6b68]">{l}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <span className="text-[2.3cqw] font-medium" style={{ color: accent }}>
          On track for Series A milestones →
        </span>
      </div>
    </Frame>
  );
}

// 6) Monochrome — minimal statement slide, spacing as the only decoration.
function Monochrome() {
  return (
    <Frame background="#ffffff" color="#111111">
      <div className="flex h-full flex-col justify-between px-[8%] py-[7.5%]">
        <span className="text-[2.2cqw] font-semibold uppercase tracking-[0.3em] text-[#111111]">
          01 — Principle
        </span>
        <h3 className="text-[9cqw] font-medium leading-[0.98] tracking-[-0.03em]">
          Less, but better.
        </h3>
        <div className="flex items-center justify-between">
          <div className="h-px w-[30%] bg-[#111111]" />
          <span className="text-[2.1cqw] uppercase tracking-[0.24em] text-[#7d7d7d]">
            Monochrome
          </span>
        </div>
      </div>
    </Frame>
  );
}

// Generic fallback for uploaded / custom templates — a clean titled slide
// using the template's own accent so uploads still read as a real deck.
function GenericPreview({ template }: { template: Template }) {
  const { theme } = template;
  return (
    <Frame background="#ffffff" color="#1a1b21" serif={theme.fontFamily === "serif"}>
      <div className="relative flex h-full flex-col px-[8%] py-[7%]">
        <div
          className="absolute left-0 top-0 h-full w-[1.6cqw]"
          style={{ background: theme.accent }}
        />
        <span
          className="text-[2.3cqw] font-semibold uppercase tracking-[0.2em]"
          style={{ color: theme.accent }}
        >
          {template.name}
        </span>
        <h3 className="mt-[3%] text-[6.4cqw] font-bold leading-[1.02] tracking-[-0.02em]">
          Your brand, applied.
        </h3>
        <div className="mt-auto space-y-[3%]">
          <div className="h-[2cqw] w-[70%] rounded-full bg-[#eceef5]" />
          <div className="h-[2cqw] w-[52%] rounded-full bg-[#eceef5]" />
          <div className="h-[2cqw] w-[60%] rounded-full bg-[#eceef5]" />
        </div>
      </div>
    </Frame>
  );
}

export function TemplatePreview({ template }: { template: Template }) {
  switch (template.id) {
    case "tpl_editorial":
      return <Editorial accent={template.theme.accent} />;
    case "tpl_boardroom":
      return <Boardroom accent={template.theme.accent} />;
    case "tpl_sales":
      return <SalesMotion accent={template.theme.accent} />;
    case "tpl_consulting":
      return <Consulting accent={template.theme.accent} />;
    case "tpl_startup":
      return <StartupUpdate accent={template.theme.accent} />;
    case "tpl_mono":
      return <Monochrome />;
    default:
      return <GenericPreview template={template} />;
  }
}
