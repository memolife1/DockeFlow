"use client";

import { useState } from "react";
import { useSubscription } from "@/lib/useSubscription";
import { UpgradeModal } from "./UpgradeModal";

// Shown in the dashboard header. Renders nothing in local/demo mode or
// for the unlimited (owner) plan, per spec.
export function PlanBadge() {
  const { subscription, loading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (loading || subscription.planId === "unlimited") return null;

  const { planName, presentationsUsed, presentationsLimit, planId } = subscription;

  return (
    <>
      <button
        onClick={() => setShowUpgrade(true)}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-line-strong hover:text-ink"
      >
        {planName}
        {presentationsLimit >= 0 && (
          <span className="text-ink-faint">
            · {presentationsUsed}/{presentationsLimit} used this month
          </span>
        )}
        {planId === "free" && <span className="font-semibold text-accent">Upgrade</span>}
      </button>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentPlan={planId}
      />
    </>
  );
}
