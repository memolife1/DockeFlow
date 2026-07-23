"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FONT_OPTIONS, getFontById } from "@/lib/fonts";
import { ImageReplacer } from "./ImageReplacer";
import type {
  BrandLogo,
  LayoutType,
  Presentation,
  Slide,
  SlideDesign,
  TemplateTheme,
} from "@/lib/types";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconTrash, IconCopy, IconUpload, IconX } from "@/components/ui/icons";
import { resolveLayoutId } from "@/lib/layouts/specs";
import { cropDataUriTo16x9 } from "@/lib/cropImage";
import { useStore } from "@/lib/store";
import { cn, textOf } from "@/lib/utils";
import {
  BACKGROUND_DESIGNS,
  BACKGROUND_DESIGN_KEYS,
  type BackgroundDesignKey,
} from "@/lib/backgroundDesigns";

const IMAGE_LAYOUTS = new Set([
  "content_image_right",
  "content_image_left",
  "image_full_bleed",
  "image_two_column",
  "image_four_grid",
  "image_showcase",
]);

const LAYOUTS: { value: LayoutType; label: string }[] = [
  { value: "title_hero", label: "Title — hero" },
  { value: "title_split", label: "Title — split panel" },
  { value: "agenda", label: "Agenda" },
  { value: "section_divider", label: "Section divider" },
  { value: "content_bullets", label: "Content — bullets" },
  { value: "content_image_right", label: "Content — image right" },
  { value: "content_image_left", label: "Content — image left" },
  { value: "two_column_compare", label: "Two-column compare" },
  { value: "stat_kpi", label: "Stat / KPI cards" },
  { value: "timeline_horizontal", label: "Timeline" },
  { value: "process_steps", label: "Process steps" },
  { value: "funnel", label: "Funnel" },
  { value: "swot_matrix", label: "SWOT matrix" },
  { value: "chart_focus", label: "Chart focus" },
  { value: "team_grid", label: "Team grid" },
  { value: "closing_cta", label: "Closing / next steps" },
  { value: "image_full_bleed", label: "Image — full bleed" },
  { value: "image_two_column", label: "Image — two column" },
  { value: "image_four_grid", label: "Image — four grid" },
  { value: "image_showcase", label: "Image — showcase" },
  { value: "quote_testimonial", label: "Quote / testimonial" },
  { value: "data_table", label: "Data table" },
  { value: "callout_box", label: "Callout box" },
];

const stripHash = (hex: string) => hex.replace("#", "").toUpperCase();

export function Inspector({
  slide,
  onChange,
  onDuplicate,
  onDelete,
  canDelete,
  presentation,
  theme,
  onUpdatePresentation,
}: {
  slide: Slide;
  onChange: (patch: Partial<Slide>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  presentation: Presentation;
  theme: TemplateTheme;
  onUpdatePresentation: (patch: Partial<Presentation>) => void;
}) {
  const { getUserImages, getBrandLogos } = useStore();
  const logos = getBrandLogos();
  const [tab, setTab] = useState<"content" | "design">("content");
  const [designScope, setDesignScope] = useState<"slide" | "all">("slide");
  const layoutId = resolveLayoutId(slide);
  const userImages = IMAGE_LAYOUTS.has(layoutId) ? getUserImages() : [];

  const setLine = (i: number, value: string) => {
    const content = [...slide.content];
    content[i] = value;
    onChange({ content });
  };
  const addLine = () => onChange({ content: [...slide.content, ""] });
  const removeLine = (i: number) =>
    onChange({ content: slide.content.filter((_, idx) => idx !== i) });

  const overrides = presentation.themeOverrides;
  const setOverride = (patch: Partial<NonNullable<Presentation["themeOverrides"]>>) =>
    onUpdatePresentation({ themeOverrides: { ...overrides, ...patch } });

  const sd = slide.slideDesign;

  // Effective current values shown in the pickers — slide override wins,
  // then the presentation-wide override, then the template default.
  const accentHex = sd?.accentColor ?? overrides?.accent ?? stripHash(theme.accent);
  const surfaceHex = sd?.backgroundColor ?? overrides?.surface ?? stripHash(theme.surface);
  const inkHex = sd?.bodyColor ?? overrides?.ink ?? stripHash(theme.ink);
  const headlineHex = sd?.headlineColor ?? inkHex;
  const fontFamily = sd?.headingFont ?? overrides?.fontFamily ?? theme.fontFamily;
  const bodyFontFamily = sd?.bodyFont ?? overrides?.bodyFontFamily ?? "sans";
  const headingFontId =
    sd?.headingFontId ?? overrides?.headingFontId ?? (fontFamily === "serif" ? "playfair" : "inter");
  const bodyFontId =
    sd?.bodyFontId ?? overrides?.bodyFontId ?? (bodyFontFamily === "serif" ? "lora" : "inter");
  const backgroundDesign: BackgroundDesignKey =
    ((sd?.backgroundDesign ?? overrides?.backgroundDesign) as BackgroundDesignKey) ?? "none";
  const backgroundImageUri = sd?.backgroundImageUri ?? overrides?.backgroundImageUri;
  const decorationStyle = sd?.decorationStyle ?? overrides?.decorationStyle ?? "bubbles";

  // Applies a design patch respecting the scope toggle: "This slide" writes
  // only slide.slideDesign; "All slides" writes the mapped keys to the
  // presentation-wide themeOverrides too (and still mirrors onto the current
  // slide's slideDesign so the change is visible immediately without
  // re-deriving effective values from two sources).
  const applyDesign = (patch: Partial<SlideDesign>) => {
    if (designScope === "all") {
      const themeMap: Partial<Record<keyof SlideDesign, string>> = {
        accentColor: "accent",
        backgroundColor: "surface",
        bodyColor: "ink",
        backgroundDesign: "backgroundDesign",
        backgroundImageUri: "backgroundImageUri",
        headingFont: "fontFamily",
        bodyFont: "bodyFontFamily",
        headingFontId: "headingFontId",
        bodyFontId: "bodyFontId",
      };
      const themePatch: Record<string, string | undefined> = {};
      for (const [k, v] of Object.entries(patch)) {
        const mapped = themeMap[k as keyof SlideDesign];
        if (mapped) themePatch[mapped] = v as string | undefined;
      }
      if (Object.keys(themePatch).length) setOverride(themePatch);
    }
    onChange({ slideDesign: { ...sd, ...patch } });
  };

  const resetDesign = () => {
    if (designScope === "all") {
      onUpdatePresentation({ themeOverrides: {} });
    }
    onChange({ slideDesign: undefined });
  };

  return (
    <div className="thin-scroll flex h-full flex-col overflow-y-auto border-l border-line bg-paper">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
          Slide {slide.orderIndex + 1}
        </span>
        <div className="flex items-center gap-1 rounded-lg bg-paper-sunk p-0.5">
          {(["content", "design"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[12px] font-medium capitalize transition-colors",
                tab === t ? "bg-white text-ink shadow-card" : "text-ink-muted hover:text-ink",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {tab === "content" ? (
        <>
          <div className="flex-1 space-y-5 p-5">
            <Field label="Layout" htmlFor="layout">
              <Select
                id="layout"
                value={resolveLayoutId(slide)}
                onChange={(e) => onChange({ layoutType: e.target.value as LayoutType })}
              >
                {LAYOUTS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Title" htmlFor="stitle">
              <Textarea
                id="stitle"
                rows={2}
                value={slide.title}
                onChange={(e) => onChange({ title: e.target.value })}
              />
            </Field>

            {layoutId === "stat_kpi" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                    Stats
                  </span>
                  <button
                    onClick={() => {
                      if ((slide.stats ?? []).length >= 4) return;
                      const stats = [...(slide.stats ?? []), { value: "0%", label: "New stat" }];
                      onChange({ stats });
                    }}
                    className="flex items-center gap-1 text-[12px] font-medium text-accent hover:text-accent-hover"
                  >
                    <IconPlus className="h-3 w-3" /> Add
                  </button>
                </div>
                {(slide.stats ?? []).map((stat, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-line bg-paper-soft p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-ink-muted">STAT {i + 1}</span>
                      <button
                        onClick={() => {
                          const stats = (slide.stats ?? []).filter((_, idx) => idx !== i);
                          onChange({ stats });
                        }}
                        className="text-ink-faint hover:text-red-500"
                        aria-label={`Remove stat ${i + 1}`}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Field label="Value">
                      <Input
                        value={stat.value}
                        placeholder="e.g. 47%, $2.4M, 3x"
                        onChange={(e) => {
                          const stats = (slide.stats ?? []).map((st, idx) =>
                            idx === i ? { ...st, value: e.target.value } : st,
                          );
                          onChange({ stats });
                        }}
                      />
                    </Field>
                    <Field label="Label">
                      <Input
                        value={stat.label}
                        placeholder="e.g. revenue growth in Q3"
                        onChange={(e) => {
                          const stats = (slide.stats ?? []).map((st, idx) =>
                            idx === i ? { ...st, label: e.target.value } : st,
                          );
                          onChange({ stats });
                        }}
                      />
                    </Field>
                  </div>
                ))}
                {(!slide.stats || slide.stats.length === 0) && (
                  <p className="text-[12px] italic text-ink-faint">No stats yet. Click + Add to add one.</p>
                )}
              </div>
            )}

            {layoutId === "data_table" && (
              <div className="space-y-2">
                <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">
                  Table data
                </span>
                <div>
                  <p className="mb-1 text-[11px] text-ink-muted">Column headers</p>
                  <div className="flex gap-1.5">
                    {(slide.tableData?.headers ?? ["Column 1", "Column 2", "Column 3"]).map((h, i) => (
                      <Input
                        key={i}
                        value={h}
                        placeholder={`Col ${i + 1}`}
                        onChange={(e) => {
                          const headers = [
                            ...(slide.tableData?.headers ?? ["Column 1", "Column 2", "Column 3"]),
                          ];
                          headers[i] = e.target.value;
                          onChange({ tableData: { headers, rows: slide.tableData?.rows ?? [] } });
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-[11px] text-ink-muted">Rows</p>
                  <div className="space-y-1.5">
                    {(slide.tableData?.rows ?? []).map((row, ri) => (
                      <div key={ri} className="flex items-start gap-1.5">
                        <div className="flex flex-1 gap-1.5">
                          {(slide.tableData?.headers ?? ["", "", ""]).map((_, ci) => (
                            <Input
                              key={ci}
                              value={row[ci] ?? ""}
                              onChange={(e) => {
                                const headers = slide.tableData?.headers ?? ["Column 1", "Column 2", "Column 3"];
                                const rows = (slide.tableData?.rows ?? []).map((r, idx) =>
                                  idx === ri
                                    ? Object.assign([...r], { [ci]: e.target.value })
                                    : r,
                                );
                                onChange({ tableData: { headers, rows } });
                              }}
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => {
                            const headers = slide.tableData?.headers ?? ["Column 1", "Column 2", "Column 3"];
                            const rows = (slide.tableData?.rows ?? []).filter((_, idx) => idx !== ri);
                            onChange({ tableData: { headers, rows } });
                          }}
                          className="mt-2.5 shrink-0 text-ink-faint hover:text-red-600"
                          aria-label={`Remove row ${ri + 1}`}
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {(!slide.tableData?.rows || slide.tableData.rows.length === 0) && (
                      <p className="text-[12px] italic text-ink-faint">No rows yet.</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    const headers = slide.tableData?.headers ?? ["Column 1", "Column 2", "Column 3"];
                    const rows = [...(slide.tableData?.rows ?? []), headers.map(() => "")];
                    onChange({ tableData: { headers, rows } });
                  }}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:text-accent-hover"
                >
                  <IconPlus className="h-3.5 w-3.5" /> Add row
                </button>
              </div>
            )}

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-soft">
                  {slide.layoutType === "title" || slide.layoutType === "section"
                    ? "Subtitle"
                    : layoutId === "quote_testimonial"
                    ? "Attribution (name/title, then company)"
                    : layoutId === "callout_box"
                    ? "Eyebrow label, then supporting text"
                    : "Points"}
                </span>
                <button
                  onClick={addLine}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-accent hover:text-accent-hover"
                >
                  <IconPlus className="h-3.5 w-3.5" /> Add
                </button>
              </div>
              <div className="space-y-2">
                {slide.content.map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Input
                      value={textOf(line)}
                      onChange={(e) => setLine(i, e.target.value)}
                      placeholder="Add a point…"
                    />
                    <button
                      onClick={() => removeLine(i)}
                      className="mt-2.5 shrink-0 text-ink-faint hover:text-red-600"
                      aria-label="Remove point"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {slide.content.length === 0 && (
                  <p className="text-[13px] text-ink-faint">No points yet.</p>
                )}
              </div>
            </div>

            {IMAGE_LAYOUTS.has(layoutId) && (
              <Field label="Slide photo">
                <div className="space-y-2">
                  <ImageReplacer
                    currentUrl={slide.imageUrl}
                    onSelect={(url) => onChange({ imageUrl: url || undefined })}
                  />
                  {userImages.length > 0 && (
                    <>
                      <p className="text-[11px] font-medium text-ink-muted">Your photos</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {userImages.slice(0, 6).map((img) => (
                          <button
                            key={img.id}
                            onClick={async () => {
                              const src = img.dataUri || img.fileUrl;
                              const cropped = src ? await cropDataUriTo16x9(src) : src;
                              onChange({ imageUrl: cropped });
                            }}
                            className="aspect-video overflow-hidden rounded border-2 border-transparent hover:border-accent"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img.dataUri || img.fileUrl}
                              alt={img.fileName}
                              className="h-full w-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <Link
                    href="/images"
                    className="inline-block text-[13px] text-accent hover:text-accent-hover"
                  >
                    {userImages.length > 0 ? "View all photos →" : "Upload your own photos →"}
                  </Link>
                  <p className="text-[11px] text-ink-faint">
                    Uploaded photos are automatically cropped to 16:9; Pexels photos fill the frame.
                  </p>
                </div>
              </Field>
            )}

            <Field label="Speaker notes" htmlFor="notes" hint="Not shown on slide">
              <Textarea
                id="notes"
                rows={4}
                value={slide.speakerNotes}
                onChange={(e) => onChange({ speakerNotes: e.target.value })}
                placeholder="What you'll say when presenting this slide…"
              />
            </Field>
          </div>

          <div className="flex items-center gap-2 border-t border-line p-4">
            <Button variant="secondary" size="sm" className="flex-1" onClick={onDuplicate}>
              <IconCopy className="h-4 w-4" /> Duplicate
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={onDelete}
              disabled={!canDelete}
            >
              <IconTrash className="h-4 w-4" /> Delete
            </Button>
          </div>
        </>
      ) : (
        <DesignTab
          designScope={designScope}
          onSetDesignScope={setDesignScope}
          layoutId={layoutId}
          accentHex={accentHex}
          surfaceHex={surfaceHex}
          inkHex={inkHex}
          headlineHex={headlineHex}
          headingFontId={headingFontId}
          bodyFontId={bodyFontId}
          backgroundDesign={backgroundDesign}
          backgroundImageUri={backgroundImageUri}
          decorationStyle={decorationStyle}
          onSetColor={(key, hex) => applyDesign({ [key]: stripHash(hex) })}
          onSetHeadingFontId={(id) => applyDesign({ headingFontId: id })}
          onSetBodyFontId={(id) => applyDesign({ bodyFontId: id })}
          onResetColors={resetDesign}
          onSetBackgroundDesign={(d) => applyDesign({ backgroundDesign: d })}
          onSetBackgroundImage={(dataUri) => applyDesign({ backgroundImageUri: dataUri })}
          onSetDecorationStyle={(d) => applyDesign({ decorationStyle: d })}
          logos={logos}
          logoWatermark={presentation.logoWatermark}
          onSetLogoWatermark={(w) => onUpdatePresentation({ logoWatermark: w })}
        />
      )}
    </div>
  );
}

function FontPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (fontId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const current = getFontById(value) ?? FONT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const filtered = FONT_OPTIONS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={rootRef} className="relative">
      <p className="mb-1.5 text-[12px] text-ink-soft">{label}</p>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-[13px] text-ink hover:border-line-strong"
        style={{ fontFamily: current.cssStack }}
      >
        <span>{current.name}</span>
        <span className="text-ink-faint">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-line bg-paper shadow-pop">
          <div className="border-b border-line p-2">
            <Input
              autoFocus
              placeholder="Search fonts…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="thin-scroll max-h-48 overflow-y-auto">
            {filtered.map((font) => (
              <button
                key={font.id}
                type="button"
                onClick={() => {
                  onChange(font.id);
                  setOpen(false);
                  setSearch("");
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition-colors hover:bg-accent-soft",
                  font.id === current.id ? "bg-accent-soft text-accent" : "text-ink",
                )}
                style={{ fontFamily: font.cssStack }}
              >
                <span>{font.name}</span>
                <span className="text-[10px] uppercase text-ink-faint">{font.category}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-[12px] text-ink-faint">No fonts match.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ColorPicker({
  label,
  hex,
  onChange,
}: {
  label: string;
  hex: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[13px] text-ink-soft">{label}</span>
      <label className="relative h-8 w-8 cursor-pointer">
        <div
          className="h-8 w-8 rounded-full border-2 border-line-strong shadow-card"
          style={{ backgroundColor: `#${hex}` }}
        />
        <input
          type="color"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={`#${hex}`}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} color`}
        />
      </label>
    </div>
  );
}

const DECORATION_STYLES: { key: NonNullable<SlideDesign["decorationStyle"]>; label: string }[] = [
  { key: "bubbles", label: "Bubbles" },
  { key: "geometric", label: "Geometric" },
  { key: "lines", label: "Lines" },
  { key: "corners", label: "Corners" },
  { key: "minimal", label: "Minimal" },
  { key: "none", label: "None" },
];

// Layouts whose specs.ts function actually renders decorationEls() — showing
// this picker elsewhere would be a dead control (e.g. content_bullets has no
// decorative shapes to swap).
const DECORATION_LAYOUTS = new Set([
  "title_hero",
  "title_split",
  "section_divider",
  "closing_cta",
]);

function DesignTab({
  designScope,
  onSetDesignScope,
  layoutId,
  accentHex,
  surfaceHex,
  inkHex,
  headlineHex,
  headingFontId,
  bodyFontId,
  backgroundDesign,
  backgroundImageUri,
  decorationStyle,
  onSetColor,
  onSetHeadingFontId,
  onSetBodyFontId,
  onResetColors,
  onSetBackgroundDesign,
  onSetBackgroundImage,
  onSetDecorationStyle,
  logos,
  logoWatermark,
  onSetLogoWatermark,
}: {
  designScope: "slide" | "all";
  onSetDesignScope: (s: "slide" | "all") => void;
  layoutId: string;
  accentHex: string;
  surfaceHex: string;
  inkHex: string;
  headlineHex: string;
  headingFontId: string;
  bodyFontId: string;
  backgroundDesign: BackgroundDesignKey;
  backgroundImageUri?: string;
  decorationStyle: NonNullable<SlideDesign["decorationStyle"]>;
  onSetColor: (key: keyof SlideDesign, hex: string) => void;
  onSetHeadingFontId: (id: string) => void;
  onSetBodyFontId: (id: string) => void;
  onResetColors: () => void;
  onSetBackgroundDesign: (d: BackgroundDesignKey) => void;
  onSetBackgroundImage: (dataUri: string | undefined) => void;
  onSetDecorationStyle: (d: NonNullable<SlideDesign["decorationStyle"]>) => void;
  logos: BrandLogo[];
  logoWatermark?: Presentation["logoWatermark"];
  onSetLogoWatermark: (w: Presentation["logoWatermark"] | undefined) => void;
}) {
  const bgInputRef = useRef<HTMLInputElement>(null);

  const handleBgFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onSetBackgroundImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex-1 space-y-6 overflow-y-auto p-5">
      <div className="flex overflow-hidden rounded-lg border border-line">
        <button
          className={cn(
            "flex-1 py-1.5 text-[12px] font-medium transition-colors",
            designScope === "slide"
              ? "bg-accent text-white"
              : "bg-paper text-ink-muted hover:text-ink",
          )}
          onClick={() => onSetDesignScope("slide")}
        >
          This slide
        </button>
        <button
          className={cn(
            "flex-1 py-1.5 text-[12px] font-medium transition-colors",
            designScope === "all"
              ? "bg-accent text-white"
              : "bg-paper text-ink-muted hover:text-ink",
          )}
          onClick={() => onSetDesignScope("all")}
        >
          All slides
        </button>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Colors
        </p>
        <div className="space-y-3">
          <ColorPicker
            label="Headline"
            hex={headlineHex}
            onChange={(h) => onSetColor("headlineColor", h)}
          />
          <ColorPicker
            label="Body text"
            hex={inkHex}
            onChange={(h) => onSetColor("bodyColor", h)}
          />
          <ColorPicker
            label="Accent"
            hex={accentHex}
            onChange={(h) => onSetColor("accentColor", h)}
          />
          <ColorPicker
            label="Background"
            hex={surfaceHex}
            onChange={(h) => onSetColor("backgroundColor", h)}
          />
        </div>
        <button
          onClick={onResetColors}
          className="mt-3 text-[12px] font-medium text-ink-muted hover:text-accent"
        >
          Reset to defaults
        </button>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Background design
        </p>
        <div className="grid grid-cols-3 gap-2">
          {BACKGROUND_DESIGN_KEYS.map((key) => {
            const d = BACKGROUND_DESIGNS[key];
            return (
              <button
                key={key}
                onClick={() => onSetBackgroundDesign(key)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-1.5 transition-colors",
                  backgroundDesign === key
                    ? "border-accent bg-accent-soft"
                    : "border-line hover:border-line-strong",
                )}
              >
                <div
                  className="h-9 w-full rounded bg-paper-sunk"
                  style={{ backgroundImage: d.css, backgroundSize: d.size }}
                />
                <span className="text-[11px] text-ink-muted">{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {DECORATION_LAYOUTS.has(layoutId) && (
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
            Slide decorations
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DECORATION_STYLES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => onSetDecorationStyle(key)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-[11px] font-medium transition-colors",
                  decorationStyle === key
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-paper text-ink-muted hover:border-line-strong hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Typography
        </p>
        <div className="space-y-3">
          <FontPicker label="Heading font" value={headingFontId} onChange={onSetHeadingFontId} />
          <FontPicker label="Body font" value={bodyFontId} onChange={onSetBodyFontId} />
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Background image
        </p>
        <input
          ref={bgInputRef}
          type="file"
          accept=".jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleBgFile(f);
            e.target.value = "";
          }}
        />
        {backgroundImageUri ? (
          <div className="relative overflow-hidden rounded-lg border border-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={backgroundImageUri} alt="" className="h-20 w-full object-cover" />
            <button
              onClick={() => onSetBackgroundImage(undefined)}
              aria-label="Remove background image"
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-ink/70 text-white hover:bg-ink/90"
            >
              <IconX className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => bgInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-line-strong bg-paper-soft py-4 text-[13px] font-medium text-ink-muted hover:border-accent hover:text-accent"
          >
            <IconUpload className="h-4 w-4" /> Upload background image
          </button>
        )}
        <p className="mt-1.5 text-[11px] text-ink-muted">
          JPG or PNG, 1920×1080 recommended
        </p>
      </div>

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Logo watermark
        </p>
        {logos.length === 0 ? (
          <p className="text-[13px] text-ink-muted">
            <Link href="/logos" className="text-accent hover:text-accent-hover">
              Upload a logo
            </Link>{" "}
            to add a watermark to every slide.
          </p>
        ) : (
          <div className="space-y-3">
            <Select
              value={logoWatermark?.logoId ?? ""}
              onChange={(e) => {
                const logoId = e.target.value;
                if (!logoId) return onSetLogoWatermark(undefined);
                onSetLogoWatermark({
                  logoId,
                  position: logoWatermark?.position ?? "bottom-right",
                  size: logoWatermark?.size ?? "small",
                });
              }}
            >
              <option value="">No watermark</option>
              {logos.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </Select>

            {logoWatermark && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      "top-left",
                      "top-right",
                      "bottom-left",
                      "bottom-right",
                    ] as const
                  ).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => onSetLogoWatermark({ ...logoWatermark, position: pos })}
                      className={cn(
                        "rounded-lg border px-2 py-1.5 text-[12px] font-medium capitalize transition-colors",
                        logoWatermark.position === pos
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line text-ink-muted hover:border-line-strong hover:text-ink",
                      )}
                    >
                      {pos.replace("-", " ")}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {(["small", "medium"] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => onSetLogoWatermark({ ...logoWatermark, size: sz })}
                      className={cn(
                        "flex-1 rounded-lg border px-3 py-1.5 text-[12px] font-medium capitalize transition-colors",
                        logoWatermark.size === sz
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line text-ink-muted hover:border-line-strong hover:text-ink",
                      )}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => onSetLogoWatermark(undefined)}
                  className="text-[12px] font-medium text-ink-muted hover:text-red-600"
                >
                  Remove watermark
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
