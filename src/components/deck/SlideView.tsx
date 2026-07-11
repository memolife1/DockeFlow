import type { Slide, TemplateTheme } from "@/lib/types";
import { cn } from "@/lib/utils";

// Renders a single slide at 16:9 using the template theme.
// This is the shared surface used by the editor canvas, preview, and landing.
export function SlideView({
  slide,
  theme,
  index,
  total,
  className,
}: {
  slide: Slide;
  theme: TemplateTheme;
  index?: number;
  total?: number;
  className?: string;
}) {
  const isTitle = slide.layoutType === "title";
  const isSection = slide.layoutType === "section";
  const isClosing = slide.layoutType === "closing";
  const hasColumns =
    slide.layoutType === "two-column" && !!slide.columns?.length;
  const isStat = slide.layoutType === "stat-block" && !!slide.stats?.length;
  const twoCol = slide.layoutType === "two-column" && !hasColumns;
  const fontClass = theme.fontFamily === "serif" ? "font-serif" : "font-sans";

  return (
    <div
      className={cn(
        "relative flex aspect-[16/9] w-full flex-col overflow-hidden [container-type:inline-size]",
        fontClass,
        className,
      )}
      style={{ background: theme.surface, color: theme.ink }}
    >
      {/* accent rule */}
      <div
        className="absolute left-0 top-0 h-full w-[6px]"
        style={{ background: theme.accent }}
      />

      <div className="flex h-full flex-col px-[7%] py-[6%] pl-[9%]">
        {/* header row */}
        <div className="flex items-center justify-between">
          <span
            className="text-[2.1cqw] font-semibold uppercase tracking-[0.16em]"
            style={{ color: theme.accent, letterSpacing: "0.14em" }}
          >
            {isTitle ? "DeckeFlow" : slide.layoutType.replace("-", " ")}
          </span>
          {typeof index === "number" && typeof total === "number" && (
            <span
              className="text-[2cqw] tabular-nums opacity-40"
            >
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </span>
          )}
        </div>

        {/* body */}
        {isTitle || isSection ? (
          <div className="flex flex-1 flex-col justify-center">
            <h2
              className="max-w-[85%] text-[6.4cqw] font-semibold leading-[1.05] tracking-[-0.02em]"
            >
              {slide.title}
            </h2>
            {slide.content[0] && (
              <p className="mt-[3%] max-w-[70%] text-[3cqw] leading-snug opacity-70">
                {slide.content[0]}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-1 flex-col pt-[3%]">
            <h2 className="text-[4.4cqw] font-semibold leading-[1.1] tracking-[-0.015em]">
              {slide.title}
            </h2>

            {isStat ? (
              <div className="mt-[5%] grid flex-1 auto-cols-fr grid-flow-col items-center gap-[4%]">
                {slide.stats!.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <div
                      className="text-[8.5cqw] font-bold leading-none tracking-[-0.03em]"
                      style={{ color: theme.accent }}
                    >
                      {stat.value}
                    </div>
                    <div className="mt-[8%] text-[2.4cqw] leading-snug opacity-70">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : hasColumns ? (
              <div className="mt-[4%] grid flex-1 grid-cols-2 gap-[5%]">
                {slide.columns!.map((col, ci) => (
                  <div key={ci} className="flex flex-col">
                    <div
                      className="text-[2.9cqw] font-semibold uppercase tracking-[0.08em]"
                      style={{ color: theme.accent }}
                    >
                      {col.heading}
                    </div>
                    <div className="mt-[6%] space-y-[4%]">
                      {col.points.map((pt, pi) => (
                        <div
                          key={pi}
                          className="flex gap-[4%] text-[2.6cqw] leading-snug"
                        >
                          <span
                            className="mt-[0.7em] h-[0.4em] w-[0.4em] shrink-0 rounded-full"
                            style={{ background: theme.accent }}
                          />
                          <span className="opacity-90">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={cn(
                  "mt-[4%] flex-1",
                  twoCol
                    ? "grid grid-cols-2 gap-x-[6%] gap-y-[2%]"
                    : "space-y-[2.4%]",
                )}
              >
                {slide.content.map((line, i) => (
                  <div
                    key={i}
                    className="flex gap-[2%] text-[2.9cqw] leading-snug"
                  >
                    <span
                      className="mt-[0.7em] h-[0.42em] w-[0.42em] shrink-0 rounded-full"
                      style={{ background: theme.accent }}
                    />
                    <span className="opacity-90">{line}</span>
                  </div>
                ))}
              </div>
            )}

            {isClosing && (
              <div
                className="mt-[3%] h-[3px] w-[22%]"
                style={{ background: theme.accent }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Scaled, non-interactive thumbnail wrapper.
export function SlideThumb({
  slide,
  theme,
  className,
}: {
  slide: Slide;
  theme: TemplateTheme;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-line bg-white shadow-card",
        className,
      )}
    >
      <SlideView slide={slide} theme={theme} />
    </div>
  );
}
