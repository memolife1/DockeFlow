"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { UploadStyleReference } from "@/components/templates/UploadStyleReference";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Eyebrow } from "@/components/ui/Misc";
import { TEMPLATE_CATEGORIES } from "@/lib/templates";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { IconArrowRight, IconLock } from "@/components/ui/icons";
import { useSubscription } from "@/lib/useSubscription";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";

const FREE_TEMPLATE_LIMIT = 3;

export default function TemplatesPage() {
  const { templates } = useStore();
  const router = useRouter();
  const { subscription } = useSubscription();
  const [cat, setCat] = useState("All");
  const [selected, setSelected] = useState<string | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const templatesLocked = !subscription.features.allTemplates;

  const uploaded = useMemo(
    () => templates.filter((t) => t.sourceType === "uploaded"),
    [templates],
  );
  const builtIn = useMemo(
    () =>
      templates
        .filter((t) => t.sourceType === "built-in")
        .filter((t) => cat === "All" || t.category === cat),
    [templates, cat],
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <PageHeader
          title="Templates"
          subtitle="Start from a built-in style, or upload your own to keep decks on brand."
          actions={
            selected && (
              <ButtonLink href={`/new`}>
                Use in new presentation
                <IconArrowRight className="h-4 w-4" />
              </ButtonLink>
            )
          }
        />

        {/* Upload */}
        <section className="mt-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <Eyebrow>Your brand</Eyebrow>
              <h2 className="u-display mt-2 text-xl">
                Upload a template or style reference
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-soft">
                Drop in a deck, PDF, or image you already use. DeckeFlow reads
                its colors and structure and applies that look to generated
                slides — so the output matches your existing material.
              </p>
            </div>
            <UploadStyleReference onUploaded={(t) => setSelected(t.id)} />
          </div>
        </section>

        {uploaded.length > 0 && (
          <section className="mt-12">
            <h3 className="mb-4 text-sm font-semibold text-ink-soft">
              Your uploads
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {uploaded.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  selected={selected === t.id}
                  onSelect={() => setSelected(t.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Built-in library */}
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-ink-soft">
              Built-in library
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[13px] font-medium transition-colors",
                    cat === c
                      ? "bg-ink text-white"
                      : "text-ink-muted hover:bg-paper-sunk hover:text-ink",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {builtIn.map((t, i) => {
              const locked = templatesLocked && i >= FREE_TEMPLATE_LIMIT;
              return (
                <div key={t.id} className="relative">
                  <TemplateCard
                    template={t}
                    selected={selected === t.id}
                    onSelect={() => (locked ? setShowUpgrade(true) : setSelected(t.id))}
                  />
                  {locked && (
                    <button
                      onClick={() => setShowUpgrade(true)}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-xl bg-paper/85 text-center backdrop-blur-[1px]"
                    >
                      <IconLock className="h-4 w-4 text-ink-muted" />
                      <span className="text-[11px] font-semibold text-ink-muted">
                        Upgrade to unlock
                      </span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-12 flex items-center justify-between rounded-xl border border-line bg-paper p-6">
          <div>
            <h3 className="font-semibold text-ink">Ready to build?</h3>
            <p className="mt-0.5 text-sm text-ink-muted">
              Templates are applied when you create a presentation.
            </p>
          </div>
          <Button onClick={() => router.push("/new")}>
            New presentation
            <IconArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentPlan={subscription.planId}
      />
    </AppShell>
  );
}
