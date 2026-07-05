import type { TemplateInfo } from "../data/templates";

/**
 * A CSS-built "slide" preview for a template — no images. Shows a title bar
 * in the template's accent color plus placeholder text blocks and a chart
 * shape. Used small in the marquee and larger in the Templates section.
 */
export function SlideMock({
  template,
  variant = "card",
}: {
  template: TemplateInfo;
  variant?: "card" | "large";
}) {
  const large = variant === "large";
  const serif = template.fontStyle === "serif";

  return (
    <div
      className="flex h-full w-full flex-col overflow-hidden bg-white"
      style={{ padding: large ? "8%" : "7%" }}
    >
      {/* eyebrow + accent tick */}
      <div className="flex items-center gap-2">
        <span
          className="rounded-full"
          style={{
            background: template.accent,
            width: large ? 10 : 7,
            height: large ? 10 : 7,
          }}
        />
        <span
          className="uppercase"
          style={{
            color: template.accent,
            fontSize: large ? 12 : 8,
            letterSpacing: "0.14em",
            fontWeight: 600,
          }}
        >
          {template.name}
        </span>
      </div>

      {/* title bar */}
      <div
        className="mt-[6%] rounded-md"
        style={{
          background: template.accent,
          height: large ? 22 : 14,
          width: "72%",
          fontFamily: serif ? "Space Grotesk, serif" : undefined,
        }}
      />
      <div
        className="mt-[3%] rounded-md"
        style={{ background: "#E7E5E4", height: large ? 12 : 8, width: "48%" }}
      />

      {/* body: text blocks + chart placeholder */}
      <div className="mt-[8%] flex flex-1 gap-[6%]">
        <div className="flex flex-1 flex-col justify-start gap-[10%] pt-[2%]">
          {[92, 78, 84, 60].map((w, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                background: i === 0 ? "#D6D3D1" : "#EDEBE8",
                height: large ? 9 : 6,
                width: `${w}%`,
              }}
            />
          ))}
        </div>
        {/* chart placeholder — bars in the accent color */}
        <div
          className="flex flex-1 items-end gap-[8%] rounded-lg p-[6%]"
          style={{ background: "#FAF9F7", border: "1px solid #EDEBE8" }}
        >
          {[40, 68, 52, 88, 72].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${h}%`,
                background: template.accent,
                opacity: 0.35 + (i / 10),
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
