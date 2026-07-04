import Link from "next/link";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { DeckPreview } from "@/components/marketing/DeckPreview";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";
import { Eyebrow } from "@/components/ui/Misc";
import {
  IconArrowRight,
  IconUpload,
  IconDoc,
  IconLayers,
} from "@/components/ui/icons";
import { BUILT_IN_TEMPLATES } from "@/lib/templates";

const STEPS = [
  {
    n: "01",
    title: "Start from a topic or your notes",
    body: "Paste rough content or just describe what the deck is for. Set the audience, objective, and tone.",
  },
  {
    n: "02",
    title: "Bring your own template",
    body: "Pick a built-in style or upload a template or reference deck. DeckeFlow follows its structure and look.",
  },
  {
    n: "03",
    title: "Edit, reorder, present",
    body: "Get a structured 6–10 slide draft. Refine the wording, rearrange slides, then preview or export.",
  },
];

const USE_CASES = [
  ["Sales teams", "Pitches, proposals, and quarterly account reviews."],
  ["Consultants", "Findings, recommendations, and client-ready briefs."],
  ["Founders", "Investor updates and all-hands that stay on message."],
  ["Account managers", "Renewals and QBRs without starting from a blank slide."],
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper-soft">
      <MarketingHeader />

      {/* Hero — asymmetric, left-aligned */}
      <section className="u-container grid grid-cols-1 gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-24">
        <div className="animate-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1 text-[12px] text-ink-soft shadow-card">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Now in early access
          </div>
          <h1 className="u-display max-w-[16ch] text-4xl leading-[1.05] sm:text-5xl lg:text-[3.4rem]">
            Client-ready presentations, built from what you already have.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Create professional presentations from a topic, your notes, or your
            own template. DeckeFlow turns rough input into polished, branded
            decks — usually in a few minutes.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/signup" size="lg">
              Create a presentation
              <IconArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/login" size="lg" variant="secondary">
              Log in
            </ButtonLink>
          </div>
          <p className="mt-5 text-[13px] text-ink-muted">
            No credit card. Bring your own template as a style reference.
          </p>
        </div>
        <div className="animate-fade-up lg:pl-4">
          <DeckPreview />
        </div>
      </section>

      {/* Differentiator band */}
      <section className="border-y border-line bg-paper">
        <div className="u-container grid grid-cols-1 gap-10 py-14 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div>
            <Eyebrow>The difference</Eyebrow>
            <h2 className="u-display mt-3 text-2xl sm:text-3xl">
              Upload a template. Every deck follows it.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-ink-soft">
            Most tools hand you their look. DeckeFlow works the other way: give
            it a template or a reference deck you already trust, and generated
            slides inherit that structure and style — so the output looks like
            it came from your team, not a generator.
          </p>
        </div>
      </section>

      {/* How it works — numbered editorial rows, not glowing cards */}
      <section id="how" className="u-container py-20">
        <Eyebrow>How it works</Eyebrow>
        <h2 className="u-display mt-3 max-w-2xl text-3xl">
          From rough input to a structured draft in three steps.
        </h2>
        <div className="mt-12 divide-y divide-line border-y border-line">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="grid grid-cols-1 gap-4 py-8 md:grid-cols-[80px_1fr_1.2fr] md:items-baseline"
            >
              <div className="font-serif text-2xl text-accent">{s.n}</div>
              <h3 className="text-lg font-semibold text-ink">{s.title}</h3>
              <p className="text-ink-soft">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates strip */}
      <section id="templates" className="border-y border-line bg-paper">
        <div className="u-container py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow>Templates</Eyebrow>
              <h2 className="u-display mt-3 text-3xl">
                Start with a considered style.
              </h2>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
            >
              Browse the library <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {BUILT_IN_TEMPLATES.map((t) => (
              <div
                key={t.id}
                className="group rounded-lg border border-line bg-paper-soft p-3 transition-shadow hover:shadow-card"
              >
                <div
                  className="mb-3 aspect-[16/10] rounded-md border border-line"
                  style={{ background: t.theme.surface }}
                >
                  <div
                    className="h-full w-[5px] rounded-l-md"
                    style={{ background: t.theme.accent }}
                  />
                </div>
                <p className="text-sm font-medium text-ink">{t.name}</p>
                <p className="text-[12px] text-ink-muted">{t.theme.character}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="usecases" className="u-container py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <Eyebrow>Built for</Eyebrow>
            <h2 className="u-display mt-3 text-3xl">
              The people who present for a living.
            </h2>
            <p className="mt-4 max-w-sm text-ink-soft">
              DeckeFlow is made for busy professionals in small and mid-sized
              teams who need a good deck without spending an afternoon on it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
                <IconDoc className="h-4 w-4 text-accent" /> From content
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
                <IconUpload className="h-4 w-4 text-accent" /> Your template
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-ink-soft">
                <IconLayers className="h-4 w-4 text-accent" /> Editable slides
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
            {USE_CASES.map(([title, body]) => (
              <div key={title} className="bg-paper p-6">
                <h3 className="font-semibold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-line bg-ink text-paper">
        <div className="u-container flex flex-col items-start gap-6 py-16 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Generate your first deck today.
            </h2>
            <p className="mt-2 text-paper/70">
              Turn a topic or a page of notes into a client-ready presentation.
            </p>
          </div>
          <ButtonLink
            href="/signup"
            size="lg"
            className="bg-accent text-white hover:bg-accent-hover"
          >
            Get started
            <IconArrowRight className="h-4 w-4" />
          </ButtonLink>
        </div>
      </section>

      {/* Footer */}
      <footer className="u-container flex flex-col items-start justify-between gap-4 py-10 sm:flex-row sm:items-center">
        <Logo />
        <p className="text-[13px] text-ink-muted">
          © {new Date().getFullYear()} DeckeFlow. A demo MVP.
        </p>
      </footer>
    </div>
  );
}
