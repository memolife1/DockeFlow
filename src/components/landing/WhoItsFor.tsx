import { FadeIn } from "./FadeIn";

const AUDIENCES = [
  {
    title: "Events & hospitality companies",
    body: "Your clients judge you by your proposals. Create branded event decks with full-bleed photo layouts, your logo on every slide, and your brand colors — in minutes before the pitch.",
  },
  {
    title: "Corporate & consulting teams",
    body: "Board decks, quarterly reviews, strategy sessions. Turn your raw data and notes into structured, argument-driven presentations that hold up in the boardroom.",
  },
  {
    title: "Sales & business development",
    body: "Stop starting from a blank slide every time. Feed in your notes from the discovery call and get a tailored pitch deck ready before the follow-up meeting.",
  },
];

export function WhoItsFor() {
  return (
    <section className="px-5 py-24 md:px-8" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto max-w-[1100px]">
        <FadeIn className="text-center">
          <h2 className="lp-display mx-auto max-w-2xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
            Built for professionals who present for a living.
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {AUDIENCES.map((a, i) => (
            <FadeIn key={a.title} style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="h-full rounded-xl p-6" style={{ background: "var(--surface-dark)", border: "1px solid var(--line-dark)" }}>
                <h3 className="lp-display text-lg font-bold text-white">{a.title}</h3>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--ink-light)" }}>
                  {a.body}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
