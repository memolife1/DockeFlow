import { SlideThumb } from "@/components/deck/SlideView";
import { BUILT_IN_TEMPLATES } from "@/lib/templates";
import type { Slide } from "@/lib/types";

const theme = BUILT_IN_TEMPLATES[0].theme;

const demo: Slide[] = [
  {
    id: "d1",
    presentationId: "demo",
    orderIndex: 0,
    title: "Q3 Account Review — Northwind Logistics",
    content: ["Prepared for the Northwind executive team"],
    speakerNotes: "",
    layoutType: "title",
  },
  {
    id: "d2",
    presentationId: "demo",
    orderIndex: 1,
    title: "Where the account stands",
    content: [
      "Adoption up 34% across three regions",
      "Two renewals due in the next quarter",
      "Support load down after the March rollout",
    ],
    speakerNotes: "",
    layoutType: "content",
  },
  {
    id: "d3",
    presentationId: "demo",
    orderIndex: 2,
    title: "Recommendation",
    content: [
      "Expand to the logistics team in Q4",
      "Lock in a two-year renewal now",
      "Set a 30-day success checkpoint",
    ],
    speakerNotes: "",
    layoutType: "section",
  },
];

export function DeckPreview() {
  return (
    <div className="relative">
      {/* Stacked deck framing */}
      <div className="absolute -right-3 -top-3 hidden h-full w-full rounded-xl border border-line bg-paper/60 sm:block" />
      <div className="relative rounded-xl border border-line bg-paper p-3 shadow-raised">
        <div className="mb-3 flex items-center gap-1.5 px-1">
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
          <span className="ml-2 text-[11px] text-ink-faint">
            Northwind — account review.deck
          </span>
        </div>
        <SlideThumb slide={demo[0]} theme={theme} />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <SlideThumb slide={demo[1]} theme={theme} />
          <SlideThumb slide={demo[2]} theme={theme} />
        </div>
      </div>
    </div>
  );
}
