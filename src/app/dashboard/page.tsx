"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { PresentationCard } from "@/components/deck/PresentationCard";
import { EmptyState } from "@/components/ui/Misc";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useStore } from "@/lib/store";
import { getTemplate } from "@/lib/templates";
import { IconPlus, IconDeck } from "@/components/ui/icons";
import { uid } from "@/lib/utils";
import { PlanBadge } from "@/components/upgrade/PlanBadge";
import { startCheckout } from "@/lib/checkout";
import type { Presentation } from "@/lib/types";

export default function DashboardPage() {
  const {
    ready,
    user,
    presentations,
    slidesFor,
    templates,
    deletePresentation,
    createPresentation,
    setSlides,
    updatePresentation,
  } = useStore();
  const [pending, setPending] = useState<Presentation | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!ready || !user) return;
    try {
      if (!localStorage.getItem("df_tour_done")) {
        // Delay slightly so the dashboard renders first.
        const t = setTimeout(() => {
          import("@/lib/tour").then(({ startTour }) => startTour());
        }, 800);
        return () => clearTimeout(t);
      }
    } catch {
      /* ignore (e.g. localStorage unavailable) */
    }
  }, [ready, user]);

  // A paid plan chosen on the landing page pricing CTA before signup is
  // parked here (see src/app/signup/page.tsx) — pick it up on first
  // dashboard load and send the user straight into Stripe Checkout.
  useEffect(() => {
    if (!user) return;
    let pendingPriceId: string | null = null;
    try {
      pendingPriceId = localStorage.getItem("pending_price_id");
      localStorage.removeItem("pending_plan");
      localStorage.removeItem("pending_price_id");
    } catch {
      /* ignore (e.g. localStorage unavailable) */
    }
    if (pendingPriceId) void startCheckout(pendingPriceId);
  }, [user]);

  const uploaded = useMemo(
    () => templates.filter((t) => t.sourceType === "uploaded"),
    [templates],
  );

  const filtered = presentations.filter((p) =>
    p.title.toLowerCase().includes(query.toLowerCase()),
  );

  const duplicate = (p: Presentation) => {
    const copy = createPresentation({
      title: `${p.title} (copy)`,
      subtitle: p.subtitle,
      mode: p.mode,
      audience: p.audience,
      goal: p.goal,
      tone: p.tone,
      templateId: p.templateId,
      status: p.status,
    });
    const clonedSlides = slidesFor(p.id).map((s) => ({
      ...s,
      id: uid("slide"),
      presentationId: copy.id,
    }));
    setSlides(copy.id, clonedSlides);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl px-6 py-10 sm:px-10">
        <PageHeader
          title={`Welcome back, ${user?.name.split(" ")[0] ?? "there"}`}
          subtitle="Your presentations, ready to edit, preview, or export."
          actions={
            <div className="flex items-center gap-3">
              {user && <PlanBadge />}
              <ButtonLink href="/new">
                <IconPlus className="h-4 w-4" />
                New presentation
              </ButtonLink>
            </div>
          }
        />

        {presentations.length > 0 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <input
              placeholder="Search presentations…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 w-full max-w-xs rounded-lg border border-line-strong bg-paper px-3 text-sm placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring"
            />
            <span className="shrink-0 text-[13px] text-ink-muted">
              {presentations.length} total
            </span>
          </div>
        )}

        <div className="mt-6" data-tour="dashboard-list">
          {presentations.length === 0 ? (
            <EmptyState
              icon={<IconDeck className="h-5 w-5" />}
              title="No presentations yet"
              body="Start from a topic or paste in your notes. DeckeFlow will draft a structured 6–10 slide deck you can edit and present."
              action={
                <ButtonLink href="/new">
                  <IconPlus className="h-4 w-4" />
                  Create your first presentation
                </ButtonLink>
              }
            />
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-ink-muted">
              No presentations match “{query}”.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <PresentationCard
                  key={p.id}
                  presentation={p}
                  slides={slidesFor(p.id)}
                  template={getTemplate(p.templateId, uploaded)}
                  onDelete={() => setPending(p)}
                  onDuplicate={() => duplicate(p)}
                  onRename={(title) => updatePresentation(p.id, { title })}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Delete presentation?"
        description={`“${pending?.title}” and its slides will be permanently removed. This can't be undone.`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (pending) deletePresentation(pending.id);
                setPending(null);
              }}
            >
              Delete
            </Button>
          </>
        }
      />
    </AppShell>
  );
}
