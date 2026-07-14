"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { BrandLogo, LayoutType, Presentation, Slide, TemplateTheme } from "@/lib/types";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { IconPlus, IconTrash, IconCopy, IconUpload, IconX } from "@/components/ui/icons";
import { resolveLayoutId } from "@/lib/layouts/specs";
import { cropDataUriTo16x9 } from "@/lib/cropImage";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
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

  const accentHex = overrides?.accent ?? stripHash(theme.accent);
  const surfaceHex = overrides?.surface ?? stripHash(theme.surface);
  const inkHex = overrides?.ink ?? stripHash(theme.ink);
  const fontFamily = overrides?.fontFamily ?? theme.fontFamily;
  const backgroundDesign: BackgroundDesignKey =
    (overrides?.backgroundDesign as BackgroundDesignKey) ?? "none";

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

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[13px] font-medium text-ink-soft">
                  {slide.layoutType === "title" || slide.layoutType === "section"
                    ? "Subtitle"
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
                      value={line}
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
                  {slide.imageUrl && (
                    <div className="h-24 w-full overflow-hidden rounded-lg border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={slide.imageUrl}
                        alt="Slide photo"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  {userImages.length > 0 && (
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
                  )}
                  <Link
                    href="/images"
                    className="inline-block text-[13px] text-accent hover:text-accent-hover"
                  >
                    {userImages.length > 0 ? "View all photos →" : "Upload photos →"}
                  </Link>
                  <p className="text-[11px] text-ink-faint">
                    Images are automatically cropped to 16:9 to fit slide dimensions.
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
          accentHex={accentHex}
          surfaceHex={surfaceHex}
          inkHex={inkHex}
          fontFamily={fontFamily}
          bodyFontFamily={overrides?.bodyFontFamily ?? "sans"}
          backgroundDesign={backgroundDesign}
          backgroundImageUri={overrides?.backgroundImageUri}
          onSetColor={(key, hex) => setOverride({ [key]: stripHash(hex) })}
          onSetFontFamily={(f) => setOverride({ fontFamily: f })}
          onSetBodyFontFamily={(f) => setOverride({ bodyFontFamily: f })}
          onResetColors={() =>
            setOverride({ accent: undefined, surface: undefined, ink: undefined })
          }
          onSetBackgroundDesign={(d) => setOverride({ backgroundDesign: d })}
          onSetBackgroundImage={(dataUri) => setOverride({ backgroundImageUri: dataUri })}
          logos={logos}
          logoWatermark={presentation.logoWatermark}
          onSetLogoWatermark={(w) => onUpdatePresentation({ logoWatermark: w })}
        />
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

function DesignTab({
  accentHex,
  surfaceHex,
  inkHex,
  fontFamily,
  bodyFontFamily,
  backgroundDesign,
  backgroundImageUri,
  onSetColor,
  onSetFontFamily,
  onSetBodyFontFamily,
  onResetColors,
  onSetBackgroundDesign,
  onSetBackgroundImage,
  logos,
  logoWatermark,
  onSetLogoWatermark,
}: {
  accentHex: string;
  surfaceHex: string;
  inkHex: string;
  fontFamily: "sans" | "serif";
  bodyFontFamily: "sans" | "serif";
  backgroundDesign: BackgroundDesignKey;
  backgroundImageUri?: string;
  onSetColor: (key: "accent" | "surface" | "ink", hex: string) => void;
  onSetFontFamily: (f: "sans" | "serif") => void;
  onSetBodyFontFamily: (f: "sans" | "serif") => void;
  onResetColors: () => void;
  onSetBackgroundDesign: (d: BackgroundDesignKey) => void;
  onSetBackgroundImage: (dataUri: string | undefined) => void;
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
      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Colors
        </p>
        <div className="space-y-3">
          <ColorPicker label="Accent color" hex={accentHex} onChange={(h) => onSetColor("accent", h)} />
          <ColorPicker label="Background" hex={surfaceHex} onChange={(h) => onSetColor("surface", h)} />
          <ColorPicker label="Text color" hex={inkHex} onChange={(h) => onSetColor("ink", h)} />
        </div>
        <button
          onClick={onResetColors}
          className="mt-3 text-[12px] font-medium text-ink-muted hover:text-accent"
        >
          Reset colors to template defaults
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

      <div>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          Typography
        </p>
        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[12px] text-ink-soft">Heading font</p>
            <div className="flex gap-2">
              {(["sans", "serif"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => onSetFontFamily(f)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium capitalize transition-colors",
                    fontFamily === f
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-ink-muted hover:border-line-strong hover:text-ink",
                  )}
                >
                  {f === "sans" ? "Sans-serif" : "Serif"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[12px] text-ink-soft">Body font</p>
            <div className="flex gap-2">
              {(["sans", "serif"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => onSetBodyFontFamily(f)}
                  className={cn(
                    "flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium capitalize transition-colors",
                    bodyFontFamily === f
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-line text-ink-muted hover:border-line-strong hover:text-ink",
                  )}
                >
                  {f === "sans" ? "Sans-serif" : "Serif"}
                </button>
              ))}
            </div>
          </div>
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
