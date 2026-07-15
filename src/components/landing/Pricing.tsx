import Link from "next/link";
import { FadeIn } from "./FadeIn";
import { Icon } from "./icons";

interface Tier {
  name: string;
  price: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}

const TIERS: Tier[] = [
  {
    name: "Free",
    price: "$0",
    features: [
      "1 presentation per month",
      "Up to 4 slides",
      "3 basic templates",
      "PDF export only",
      "Watermark on slides",
    ],
    cta: "Get started free",
    href: "/signup",
  },
  {
    name: "Starter",
    price: "$9",
    features: [
      "10 presentations per month",
      "Up to 12 slides",
      "All 16 templates",
      "PPTX + PDF export",
      "No watermark",
      "Stock photos included",
    ],
    cta: "Start with Starter",
    href: "/signup?plan=starter",
  },
  {
    name: "Pro",
    price: "$29",
    features: [
      "60 presentations per month",
      "Up to 30 slides",
      "Brand upload & color extraction",
      "Logo watermarks on slides",
      "Upload your own photos",
      "All 5 languages",
      "All 20 layouts",
      "Share links",
    ],
    cta: "Start with Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    name: "Business",
    price: "$79",
    features: [
      "150 presentations per month",
      "Up to 30 slides",
      "Everything in Pro",
      "Priority email support",
      "Unlimited brand logos",
      "Unlimited photo library",
    ],
    cta: "Start with Business",
    href: "/signup?plan=business",
  },
];

const COMPARISON_ROWS: [string, string, string, string, string][] = [
  ["Presentations/month", "1", "10", "60", "150"],
  ["Max slides", "4", "12", "30", "30"],
  ["Templates", "3", "16", "20", "20"],
  ["Export formats", "PDF", "PPTX + PDF", "PPTX + PDF + link", "PPTX + PDF + link"],
  ["Brand upload", "—", "—", "✓", "✓"],
  ["Own photos", "—", "✓", "✓", "✓"],
  ["Languages", "1", "1", "5", "5"],
  ["Watermark", "Yes", "No", "No", "No"],
  ["Support", "Community", "Community", "Email", "Priority email"],
];

export function Pricing() {
  return (
    <section className="px-5 py-24 md:px-8" style={{ background: "var(--bg)" }}>
      <div className="mx-auto max-w-[1150px]">
        <FadeIn className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            Simple, honest pricing
          </p>
          <h2 className="lp-display mx-auto mt-3 max-w-xl text-3xl font-extrabold leading-tight md:text-5xl" style={{ color: "var(--ink)" }}>
            Start free. Upgrade when you need more.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base" style={{ color: "var(--ink-muted)" }}>
            No hidden fees. No credit card required to start.
          </p>
        </FadeIn>

        <div className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
          {TIERS.map((tier, i) => (
            <FadeIn key={tier.name} style={{ transitionDelay: `${i * 60}ms` }}>
              <div
                className="relative flex h-full flex-col rounded-2xl p-5 md:p-6"
                style={{
                  background: "var(--surface)",
                  border: tier.highlight ? "2px solid var(--accent)" : "1px solid var(--line)",
                  boxShadow: tier.highlight ? "0 20px 45px -20px rgba(37,99,235,0.35)" : undefined,
                  transform: tier.highlight ? "scale(1.03)" : undefined,
                }}
              >
                {tier.highlight && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    Most popular
                  </span>
                )}
                <h3 className="lp-display text-lg font-extrabold" style={{ color: "var(--ink)" }}>
                  {tier.name}
                </h3>
                <p className="mt-1">
                  <span className="lp-display text-3xl font-extrabold" style={{ color: "var(--ink)" }}>
                    {tier.price}
                  </span>
                  <span className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    /month
                  </span>
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-[13px] leading-snug" style={{ color: "var(--ink-muted)" }}>
                      <Icon name="check" size={14} color="var(--accent)" className="mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className="mt-6 rounded-full px-4 py-3 text-center text-sm font-bold transition-transform hover:scale-[1.02]"
                  style={
                    tier.highlight
                      ? { background: "var(--accent)", color: "#fff" }
                      : { background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--line)" }
                  }
                >
                  {tier.cta}
                </Link>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-12">
          <details className="rounded-xl" style={{ border: "1px solid var(--line)", background: "var(--surface)" }}>
            <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold" style={{ color: "var(--ink)" }}>
              Compare all plans in detail
            </summary>
            <div className="overflow-x-auto border-t px-5 pb-5 pt-4" style={{ borderColor: "var(--line)" }}>
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr style={{ color: "var(--ink-muted)" }}>
                    <th className="py-2 pr-4 font-semibold">Feature</th>
                    {TIERS.map((t) => (
                      <th key={t.name} className="py-2 pr-4 font-semibold" style={{ color: "var(--ink)" }}>
                        {t.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row) => (
                    <tr key={row[0]} style={{ borderTop: "1px solid var(--line)" }}>
                      {row.map((cell, i) => (
                        <td
                          key={i}
                          className="py-2.5 pr-4"
                          style={{ color: i === 0 ? "var(--ink)" : "var(--ink-muted)", fontWeight: i === 0 ? 600 : 400 }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </FadeIn>
      </div>
    </section>
  );
}
