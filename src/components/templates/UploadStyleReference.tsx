"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { Spinner } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { IconUpload, IconCheck } from "@/components/ui/icons";
import type { Template, TemplateTheme } from "@/lib/types";
import { saveBrandThemeToCloud } from "@/lib/supabaseSync";

const BRAND_ROLES = ["primary", "dark", "accent", "surface"] as const;
const ROLE_LABELS: Record<(typeof BRAND_ROLES)[number], string> = {
  primary: "Primary",
  dark: "Dark",
  accent: "Accent",
  surface: "Surface",
};

// Deterministic fallback accent for non-.pptx style references (images/PDFs),
// where there is no real theme XML to parse — this is a visual style
// reference, not a brand-color extraction.
const PALETTE = ["#c2410c", "#1e3a34", "#b91c1c", "#3730a3", "#0f766e", "#292524", "#7c2d12", "#155e63"];
function accentFromName(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

type Brand = NonNullable<TemplateTheme["brand"]>;

export function UploadStyleReference({
  onUploaded,
}: {
  onUploaded?: (template: Template) => void;
}) {
  const { addUploadedTemplate, addStyleRef } = useStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"file" | "url">("file");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [state, setState] = useState<"idle" | "reading" | "confirm" | "done" | "error">("idle");
  const [drag, setDrag] = useState(false);
  const [lastName, setLastName] = useState("");
  const [source, setSource] = useState<"file" | "url">("file");
  const [error, setError] = useState("");
  const [pendingBrand, setPendingBrand] = useState<Brand | null>(null);
  // The as-extracted brand, kept untouched so "Reset to extracted" always has
  // something to restore to even after the user tweaks colors/font.
  const extractedBrandRef = useRef<Brand | null>(null);

  const beginConfirm = (name: string, brand: Brand, kind: "file" | "url" = "file") => {
    extractedBrandRef.current = brand;
    setLastName(name);
    setSource(kind);
    setPendingBrand(brand);
    setState("confirm");
  };

  const setRole = (role: (typeof BRAND_ROLES)[number], hex: string) => {
    setPendingBrand((prev) =>
      prev
        ? { ...prev, roles: { ...prev.roles, [role]: hex.replace("#", "").toUpperCase() } }
        : prev,
    );
  };

  const finalizeTemplate = (name: string, brand?: Brand) => {
    const accent = brand?.roles?.primary
      ? `#${brand.roles.primary}`
      : accentFromName(name);
    const tpl = addUploadedTemplate({
      name: (brand?.name || name.replace(/\.[^.]+$/, "")).slice(0, 40) || "Custom template",
      category: "Uploaded",
      description: brand
        ? source === "url"
          ? "Extracted from your website — colors, fonts, and logo applied to every layout."
          : "Extracted from your uploaded PowerPoint — colors, fonts, and logo applied to every layout."
        : "Your uploaded reference. Generated decks follow this style.",
      sourceType: "uploaded",
      theme: {
        accent,
        surface: brand?.roles?.surface ? `#${brand.roles.surface}` : "#ffffff",
        ink: "#1c1917",
        fontFamily: brand?.fontFamily ?? "sans",
        character: brand ? "Your brand · extracted" : "Custom · from your file",
        brand,
      },
    });
    setState("done");
    onUploaded?.(tpl);
    if (brand && isSupabaseConfigured) void saveBrandThemeToCloud(brand);
  };

  const handlePptx = async (file: File) => {
    setState("reading");
    setLastName(file.name);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/brand/extract", { method: "POST", body: form });
      const data = (await res.json()) as { brand?: Brand; error?: string };
      if (!res.ok || !data.brand) {
        setError(data.error || "Couldn't read that file.");
        setState("error");
        return;
      }
      beginConfirm(file.name, data.brand);
    } catch {
      setError("Upload failed. Please try again.");
      setState("error");
    }
  };

  const handleWebsiteUrl = async () => {
    const raw = websiteUrl.trim();
    if (!raw) return;
    setState("reading");
    setLastName(raw);
    setError("");
    try {
      const url = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const res = await fetch("/api/brand/extract-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = (await res.json()) as { brand?: Brand; domain?: string; error?: string };
      if (!res.ok || !data.brand) {
        setError(data.error || "Couldn't read that website.");
        setState("error");
        return;
      }
      beginConfirm(data.domain || raw, data.brand, "url");
    } catch {
      setError("Couldn't reach that website. Please try again.");
      setState("error");
    }
  };

  const handleOther = (file: File) => {
    setState("reading");
    setLastName(file.name);
    const accent = accentFromName(file.name);
    const url = URL.createObjectURL(file);
    setTimeout(() => {
      addStyleRef({
        fileName: file.name,
        fileType: file.type || "unknown",
        fileUrl: url,
        extractedAccent: accent,
      });
      finalizeTemplate(file.name);
    }, 1000);
  };

  const handleFile = (file: File) => {
    if (/\.pptx$/i.test(file.name)) void handlePptx(file);
    else handleOther(file);
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const reset = () => {
    setState("idle");
    setPendingBrand(null);
    extractedBrandRef.current = null;
    setError("");
    setWebsiteUrl("");
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
      className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
        drag ? "border-accent bg-accent-soft" : "border-line-strong bg-paper-soft"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.pptx,.key,.png,.jpg,.jpeg,.svg"
        className="hidden"
        onChange={onPick}
      />

      {state === "reading" ? (
        <>
          <Spinner className="text-accent" />
          <p className="mt-3 text-sm font-medium text-ink">
            Reading style from {lastName}…
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Extracting colors, fonts, and logo
          </p>
        </>
      ) : state === "confirm" && pendingBrand ? (
        <div className="w-full max-w-sm text-left">
          <p className="text-sm font-medium text-ink">
            {source === "url"
              ? `Here's what we found on ${lastName}`
              : `Here's what we found in ${lastName}`}
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            Confirm to apply this brand to every layout — or tweak any color first.
          </p>
          <div className="mt-4 flex items-center gap-3">
            {BRAND_ROLES.map((role) => {
              const hex = pendingBrand.roles?.[role] || "CCCCCC";
              return (
                <div key={role} className="flex flex-col items-center gap-1">
                  <label className="relative h-10 w-10 cursor-pointer">
                    <div
                      className="h-10 w-10 rounded-full border-2 border-line-strong shadow-card"
                      style={{ backgroundColor: `#${hex}` }}
                    />
                    <input
                      type="color"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      value={`#${hex}`}
                      onChange={(e) => setRole(role, e.target.value)}
                      aria-label={`${ROLE_LABELS[role]} color`}
                    />
                  </label>
                  <span className="text-[10px] text-ink-muted">{ROLE_LABELS[role]}</span>
                </div>
              );
            })}
            {pendingBrand.logoDataUri && (
              <div className="ml-1 flex flex-col items-center gap-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={pendingBrand.logoDataUri}
                  alt="Extracted logo"
                  className="h-10 w-10 rounded border border-line-strong bg-white object-contain p-1 shadow-card"
                />
                <span className="text-[10px] text-ink-muted">Logo</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-[12px] text-ink-muted">
              Font
              <Select
                className="h-8 w-32 text-[13px]"
                value={pendingBrand.fontFamily ?? "sans"}
                onChange={(e) =>
                  setPendingBrand((prev) =>
                    prev
                      ? { ...prev, fontFamily: e.target.value as "sans" | "serif" }
                      : prev,
                  )
                }
              >
                <option value="sans">Sans-serif</option>
                <option value="serif">Serif</option>
              </Select>
            </label>
            {extractedBrandRef.current && (
              <button
                onClick={() => setPendingBrand(extractedBrandRef.current)}
                className="text-[12px] font-medium text-accent hover:text-accent-hover"
              >
                Reset to extracted
              </button>
            )}
          </div>

          {(pendingBrand.fontHead || pendingBrand.fontBody) && (
            <p className="mt-2 text-[12px] text-ink-muted">
              Extracted font: {pendingBrand.fontHead || pendingBrand.fontBody}
            </p>
          )}
          <div className="mt-4 flex gap-2">
            <Button size="sm" onClick={() => finalizeTemplate(lastName, pendingBrand)}>
              Use this brand
            </Button>
            <Button size="sm" variant="secondary" onClick={reset}>
              Cancel
            </Button>
          </div>
        </div>
      ) : state === "done" ? (
        <>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <IconCheck className="h-5 w-5" />
          </div>
          <p className="mt-3 text-sm font-medium text-ink">
            Style reference added
          </p>
          <p className="mt-1 text-[12px] text-ink-muted">
            {lastName} is now available as a template.
          </p>
          <button
            onClick={() => {
              reset();
              inputRef.current?.click();
            }}
            className="mt-3 text-[13px] font-medium text-accent hover:text-accent-hover"
          >
            Upload another
          </button>
        </>
      ) : state === "error" ? (
        <>
          <p className="text-sm font-medium text-red-600">{error}</p>
          <button
            onClick={reset}
            className="mt-3 text-[13px] font-medium text-accent hover:text-accent-hover"
          >
            Try again
          </button>
        </>
      ) : (
        <>
          <div className="mb-5 flex items-center gap-1 rounded-lg bg-paper p-1 shadow-card">
            <button
              type="button"
              onClick={() => setTab("file")}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                tab === "file" ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              📎 Upload file
            </button>
            <button
              type="button"
              onClick={() => setTab("url")}
              className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                tab === "url" ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              🔗 Paste website URL
            </button>
          </div>

          {tab === "url" ? (
            <div className="w-full max-w-xs">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink-muted shadow-card">
                <IconUpload className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">
                Extract your brand from a website
              </p>
              <p className="mt-1 text-[13px] text-ink-muted">
                Paste a client&apos;s (or your own) site and we&apos;ll pull its
                colors, font, and logo.
              </p>
              <input
                type="url"
                placeholder="https://yourcompany.com"
                className="mt-4 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleWebsiteUrl();
                }}
              />
              <Button
                size="sm"
                className="mt-3 w-full"
                onClick={() => void handleWebsiteUrl()}
                disabled={!websiteUrl.trim()}
              >
                Extract brand
              </Button>
            </div>
          ) : (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink-muted shadow-card">
                <IconUpload className="h-5 w-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-ink">
                Upload a template or style reference
              </p>
              <p className="mt-1 max-w-xs text-[13px] text-ink-muted">
                Upload your company&apos;s .pptx for real brand colors, fonts, and
                logo — or drop a PDF/image as a lighter style reference.
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="mt-4 inline-flex h-9 items-center rounded-lg border border-line-strong bg-paper px-4 text-sm font-medium text-ink hover:bg-paper-sunk"
              >
                Choose file
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
