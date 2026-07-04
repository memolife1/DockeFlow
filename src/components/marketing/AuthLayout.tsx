import { Logo } from "@/components/brand/Logo";
import { SlideThumb } from "@/components/deck/SlideView";
import { BUILT_IN_TEMPLATES } from "@/lib/templates";
import type { Slide } from "@/lib/types";

const previewSlide: Slide = {
  id: "auth",
  presentationId: "auth",
  orderIndex: 0,
  title: "Recommendation & next steps",
  content: [
    "Expand the pilot to two more teams",
    "Confirm budget owner this week",
    "Review outcomes at the 30-day mark",
  ],
  speakerNotes: "",
  layoutType: "content",
};

export function AuthLayout({
  children,
  heading,
  sub,
}: {
  children: React.ReactNode;
  heading: string;
  sub: string;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Form side */}
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-sm py-10">
            <h1 className="u-display text-2xl">{heading}</h1>
            <p className="mt-1.5 text-sm text-ink-muted">{sub}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
        <p className="text-[12px] text-ink-faint">
          Demo MVP — accounts are stored locally in your browser.
        </p>
      </div>

      {/* Editorial brand side */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-l border-line bg-paper p-12 lg:flex">
        <div className="max-w-sm">
          <p className="u-eyebrow">Why DeckeFlow</p>
          <p className="mt-4 font-serif text-2xl leading-snug text-ink">
            “It turns the notes I already have into a deck I can actually send to
            a client.”
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            Sofia M. — Account Director
          </p>
        </div>
        <div className="max-w-md [container-type:normal]">
          <SlideThumb slide={previewSlide} theme={BUILT_IN_TEMPLATES[1].theme} />
        </div>
        <div
          className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 rounded-full border border-line"
          aria-hidden
        />
      </div>
    </div>
  );
}
