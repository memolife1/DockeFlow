"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Spinner, Eyebrow } from "@/components/ui/Misc";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { UploadStyleReference } from "@/components/templates/UploadStyleReference";
import {
  IconArrowRight,
  IconArrowLeft,
  IconDoc,
  IconSparks,
  IconCheck,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { Presentation, PresentationMode, Slide, Tone } from "@/lib/types";

const TONES: { value: Tone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "confident", label: "Confident" },
  { value: "consultative", label: "Consultative" },
  { value: "friendly", label: "Friendly" },
  { value: "visionary", label: "Visionary" },
];

const LANGUAGES = [
  { value: "English", label: "English" },
  { value: "Arabic", label: "العربية" },
  { value: "French", label: "Français" },
  { value: "German", label: "Deutsch" },
  { value: "Russian", label: "Русский" },
];

const SLIDE_COUNTS: { value: number; label: string; sub: string }[] = [
  { value: 4, label: "4 slides", sub: "Quick pitch" },
  { value: 6, label: "6 slides", sub: "Brief" },
  { value: 8, label: "8 slides", sub: "Concise" },
  { value: 10, label: "10 slides", sub: "Standard" },
  { value: 12, label: "12 slides", sub: "Detailed" },
  { value: 14, label: "14 slides", sub: "Comprehensive" },
  { value: -1, label: "Custom", sub: "4–30 slides" },
];

const STEP_LABELS = ["Start", "Details", "Template", "Generate"];

export default function NewPresentationPage() {
  const router = useRouter();
  const {
    ready,
    user,
    templates,
    createPresentation,
    setSlides,
    updatePresentation,
    getUserImages,
    getBrandLogos,
  } = useStore();

  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<PresentationMode>("topic");
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    audience: "",
    goal: "",
    tone: "professional" as Tone,
    notes: "",
    language: "English",
    targetSlideCount: 10,
  });
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "");
  const [imageSource, setImageSource] = useState<"stock" | "mine" | "none">("stock");
  const [logoWatermark, setLogoWatermark] = useState<Presentation["logoWatermark"]>(undefined);
  const [customSlideCount, setCustomSlideCount] = useState(16);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const userImages = getUserImages();
  const logos = getBrandLogos();

  const uploaded = useMemo(
    () => templates.filter((t) => t.sourceType === "uploaded"),
    [templates],
  );
  const builtIn = useMemo(
    () => templates.filter((t) => t.sourceType === "built-in"),
    [templates],
  );

  const set =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const canProceed =
    step === 0
      ? true
      : step === 1
      ? form.title.trim().length > 1
      : step === 2
      ? !!templateId
      : true;

  const effectiveSlideCount =
    form.targetSlideCount === -1 ? customSlideCount : form.targetSlideCount;

  const generate = async () => {
    setError("");
    setGenerating(true);
    setStep(3);
    const pres = createPresentation({
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      mode,
      audience: form.audience.trim(),
      goal: form.goal.trim(),
      tone: form.tone,
      templateId,
      useStockImages: imageSource === "stock",
      logoWatermark,
      status: "generating",
    });
    try {
      const userImageUris =
        imageSource === "mine" && userImages.length
          ? userImages.map((i) => i.dataUri || i.fileUrl).filter(Boolean)
          : undefined;
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          presentationId: pres.id,
          mode,
          imageSource,
          useStockImages: imageSource === "stock" ? true : undefined,
          userImageUris,
          ...form,
          targetSlideCount: effectiveSlideCount,
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = (await res.json()) as { slides: Slide[] };
      setSlides(pres.id, data.slides);
      updatePresentation(pres.id, { status: "ready" });
      router.push(`/presentations/${pres.id}/edit`);
    } catch {
      updatePresentation(pres.id, { status: "error" });
      setError("Something went wrong while generating. Please try again.");
      setGenerating(false);
      setStep(2);
    }
  };

  if (ready && !user) {
    router.replace("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-paper-soft">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-line bg-paper px-6">
        <Logo href="/dashboard" />
        <Link
          href="/dashboard"
          className="text-sm text-ink-muted hover:text-ink"
        >
          Cancel
        </Link>
      </header>

      {/* Step indicator */}
      <div className="border-b border-line bg-paper">
        <div className="mx-auto flex max-w-2xl items-center gap-2 px-6 py-4">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold",
                  i < step
                    ? "bg-accent text-white"
                    : i === step
                    ? "bg-ink text-white"
                    : "bg-paper-sunk text-ink-faint",
                )}
              >
                {i < step ? <IconCheck className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[13px] font-medium",
                  i === step ? "text-ink" : "text-ink-muted",
                )}
              >
                {label}
              </span>
              {i < STEP_LABELS.length - 1 && (
                <div className="mx-1 h-px flex-1 bg-line" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 justify-center px-6 py-10">
        <div className="w-full max-w-2xl animate-fade-up">
          {step === 0 && (
            <div>
              <Eyebrow>Step 1</Eyebrow>
              <h1 className="u-display mt-2 text-2xl">
                How do you want to start?
              </h1>
              <p className="mt-1 text-sm text-ink-muted">
                Both paths produce a structured, editable deck.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {[
                  {
                    id: "topic" as const,
                    icon: IconSparks,
                    title: "Start from a topic",
                    body: "Describe the subject and let DeckeFlow structure the narrative for you.",
                  },
                  {
                    id: "content" as const,
                    icon: IconDoc,
                    title: "Start from content",
                    body: "Paste rough notes or existing material and turn it into slides.",
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMode(opt.id)}
                    className={cn(
                      "flex flex-col items-start rounded-xl border bg-paper p-5 text-left transition-all",
                      mode === opt.id
                        ? "border-accent ring-2 ring-accent-ring"
                        : "border-line hover:border-line-strong hover:shadow-card",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg",
                        mode === opt.id
                          ? "bg-accent text-white"
                          : "bg-paper-sunk text-ink-soft",
                      )}
                    >
                      <opt.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-3 font-semibold text-ink">{opt.title}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{opt.body}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <Eyebrow>Step 2</Eyebrow>
              <h1 className="u-display mt-2 text-2xl">Tell us about the deck</h1>
              <p className="mt-1 text-sm text-ink-muted">
                A little context produces a much sharper draft.
              </p>
              <div className="mt-6 space-y-4">
                <Field label="Title" htmlFor="title">
                  <Input
                    id="title"
                    autoFocus
                    placeholder="Q3 Account Review — Northwind Logistics"
                    value={form.title}
                    onChange={set("title")}
                  />
                </Field>
                <Field label="Subtitle" htmlFor="subtitle" hint="Optional">
                  <Input
                    id="subtitle"
                    placeholder="Prepared for the Northwind executive team"
                    value={form.subtitle}
                    onChange={set("subtitle")}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Audience" htmlFor="audience">
                    <Input
                      id="audience"
                      placeholder="Executive stakeholders"
                      value={form.audience}
                      onChange={set("audience")}
                    />
                  </Field>
                  <Field label="Tone" htmlFor="tone">
                    <Select id="tone" value={form.tone} onChange={set("tone")}>
                      {TONES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label="Language" hint="Controls the language of the generated content. The app interface stays in English.">
                  <div className="flex flex-wrap gap-1.5">
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, language: l.value }))}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                          form.language === l.value
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-line text-ink-muted hover:border-line-strong hover:text-ink",
                        )}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Objective" htmlFor="goal">
                  <Input
                    id="goal"
                    placeholder="Secure a two-year renewal and expansion"
                    value={form.goal}
                    onChange={set("goal")}
                  />
                </Field>
                <Field
                  label={mode === "content" ? "Your content" : "Notes"}
                  htmlFor="notes"
                  hint={
                    mode === "content"
                      ? "Paste the material to turn into slides"
                      : "Optional — anything you want covered"
                  }
                >
                  <Textarea
                    id="notes"
                    rows={6}
                    placeholder={
                      mode === "content"
                        ? "Paste notes, bullet points, or a rough outline…"
                        : "Adoption is up 34%. Two renewals due. Support load down after the March rollout…"
                    }
                    value={form.notes}
                    onChange={set("notes")}
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <Eyebrow>Step 3</Eyebrow>
              <h1 className="u-display mt-2 text-2xl">Choose a style</h1>
              <p className="mt-1 text-sm text-ink-muted">
                Pick a built-in template, or upload your own for a branded deck.
              </p>

              <div className="mt-6">
                <UploadStyleReference
                  onUploaded={(t) => setTemplateId(t.id)}
                />
              </div>

              {uploaded.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-[13px] font-semibold text-ink-soft">
                    Your uploads
                  </p>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {uploaded.map((t) => (
                      <TemplateCard
                        key={t.id}
                        template={t}
                        selected={templateId === t.id}
                        onSelect={() => setTemplateId(t.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <p className="mb-3 text-[13px] font-semibold text-ink-soft">
                  Built-in templates
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {builtIn.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      selected={templateId === t.id}
                      onSelect={() => setTemplateId(t.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Image source for image-zone slides. */}
              <div className="mt-8">
                <p className="mb-3 text-[13px] font-semibold text-ink-soft">
                  Images
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {(
                    [
                      {
                        id: "stock" as const,
                        icon: "📷",
                        title: "Stock photos",
                        body: "Pexels",
                      },
                      {
                        id: "mine" as const,
                        icon: "🖼️",
                        title: "My photos",
                        body: "Your library",
                      },
                      {
                        id: "none" as const,
                        icon: "✕",
                        title: "No images",
                        body: "Text layouts only",
                      },
                    ]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setImageSource(opt.id)}
                      className={cn(
                        "flex flex-col items-start rounded-xl border bg-paper p-4 text-left transition-all",
                        imageSource === opt.id
                          ? "border-accent ring-2 ring-accent-ring"
                          : "border-line hover:border-line-strong hover:shadow-card",
                      )}
                    >
                      <span className="text-lg">{opt.icon}</span>
                      <p className="mt-2 text-sm font-medium text-ink">{opt.title}</p>
                      <p className="mt-0.5 text-[12px] text-ink-muted">{opt.body}</p>
                    </button>
                  ))}
                </div>
                {imageSource === "mine" && userImages.length === 0 && (
                  <p className="mt-3 text-[13px] text-amber-600">
                    You haven&apos;t uploaded any photos yet.{" "}
                    <Link href="/images" className="underline hover:text-amber-700">
                      Upload some
                    </Link>{" "}
                    or pick a different image source.
                  </p>
                )}
              </div>

              {/* Slide count (drives the deck's target length). */}
              <div className="mt-8">
                <p className="mb-3 text-[13px] font-semibold text-ink-soft">
                  Deck length
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {SLIDE_COUNTS.map((sc) => (
                    <button
                      key={sc.value}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({ ...f, targetSlideCount: sc.value }))
                      }
                      className={cn(
                        "rounded-xl border px-3 py-3 text-center transition-all",
                        form.targetSlideCount === sc.value
                          ? "border-accent bg-accent-soft ring-2 ring-accent-ring"
                          : "border-line hover:border-line-strong hover:shadow-card",
                      )}
                    >
                      <p className="text-lg font-semibold text-ink">{sc.label}</p>
                      <p className="mt-0.5 text-[12px] text-ink-muted">{sc.sub}</p>
                    </button>
                  ))}
                </div>
                {form.targetSlideCount === -1 && (
                  <div className="mt-3 flex items-center gap-3">
                    <Input
                      type="number"
                      min={4}
                      max={30}
                      value={customSlideCount}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        setCustomSlideCount(
                          Number.isFinite(n) ? Math.min(30, Math.max(4, n)) : 4,
                        );
                      }}
                      className="w-24"
                    />
                    <span className="text-[13px] text-ink-muted">slides (4–30)</span>
                  </div>
                )}
              </div>

              {/* Logo watermark (optional). */}
              {logos.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-[13px] font-semibold text-ink-soft">
                    Logo watermark
                  </p>
                  <Select
                    value={logoWatermark?.logoId ?? ""}
                    onChange={(e) => {
                      const logoId = e.target.value;
                      if (!logoId) return setLogoWatermark(undefined);
                      setLogoWatermark({
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
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-4 gap-2">
                        {(
                          ["top-left", "top-right", "bottom-left", "bottom-right"] as const
                        ).map((pos) => (
                          <button
                            key={pos}
                            type="button"
                            onClick={() =>
                              setLogoWatermark((w) => (w ? { ...w, position: pos } : w))
                            }
                            className={cn(
                              "rounded-lg border px-2 py-1.5 text-[11px] font-medium capitalize transition-colors",
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
                            type="button"
                            onClick={() =>
                              setLogoWatermark((w) => (w ? { ...w, size: sz } : w))
                            }
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
                    </div>
                  )}
                </div>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600">{error}</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center py-20 text-center">
              <Spinner className="h-6 w-6 text-accent" />
              <h2 className="mt-5 text-lg font-semibold text-ink">
                Drafting your presentation…
              </h2>
              <p className="mt-1 max-w-sm text-sm text-ink-muted">
                Structuring the narrative and writing slide-friendly content in
                your selected style.
              </p>
            </div>
          )}

          {/* Footer nav */}
          {step < 3 && (
            <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <IconArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < 2 ? (
                <Button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed}
                >
                  Continue <IconArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={generate} disabled={!canProceed || generating}>
                  <IconSparks className="h-4 w-4" />
                  Generate deck
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
