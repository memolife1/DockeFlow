import { FadeIn } from "./FadeIn";

const COLUMNS = [
  {
    header: "Events companies",
    items: ["Client proposals", "Event runsheets", "Sponsor decks", "Full-bleed photo layouts"],
  },
  {
    header: "Corporate teams",
    items: ["Board presentations", "Quarterly reviews", "Department updates", "Data-heavy slides"],
  },
  {
    header: "Consultants",
    items: ["Client pitches", "Strategy decks", "Proposal decks", "White-label output"],
  },
];

export function WhoItsFor() {
  return (
    <section className="px-5 py-24 md:px-8" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto max-w-[1000px]">
        <FadeIn>
          <h2 className="max-w-2xl text-3xl text-white md:text-5xl">
            Built for professionals who present for a living.
          </h2>
        </FadeIn>

        <FadeIn className="mt-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
            {COLUMNS.map((col, i) => (
              <div
                key={col.header}
                className={i > 0 ? "md:border-l md:pl-10" : ""}
                style={{ borderColor: "var(--line-dark)" }}
              >
                <p className="lp-eyebrow" style={{ color: "var(--ink-light)" }}>
                  {col.header}
                </p>
                <div className="mt-3 h-px w-16" style={{ background: "var(--line-dark)" }} />
                <ul className="mt-5 space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="text-[15px]" style={{ color: "var(--ink-light)" }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
