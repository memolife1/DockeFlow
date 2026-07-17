"use client";

import { useState } from "react";
import { PLANS, type PlanId } from "@/lib/plans";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { startCheckout } from "@/lib/checkout";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: PlanId;
}

const UPGRADE_TIERS: PlanId[] = ["starter", "pro", "business"];

export function UpgradeModal({ isOpen, onClose, currentPlan }: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleUpgrade = async (planId: PlanId) => {
    const priceId = PLANS[planId].stripePriceId;
    if (!priceId) return;
    setError("");
    setLoadingPlan(planId);
    const errorMessage = await startCheckout(priceId);
    if (errorMessage) {
      setError(errorMessage);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-paper p-8 shadow-2xl">
        <h2 className="text-xl font-semibold text-ink">
          You&apos;ve reached your monthly limit
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Upgrade your plan to create more presentations this month.
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {UPGRADE_TIERS.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = planId === currentPlan;
            const isPopular = planId === "pro";
            return (
              <div
                key={planId}
                className={cn(
                  "flex flex-col rounded-xl border p-5",
                  isPopular ? "border-accent ring-2 ring-accent-ring" : "border-line",
                )}
              >
                <div className="text-[15px] font-semibold text-ink">{plan.name}</div>
                <div className="mt-1 text-2xl font-bold text-ink">
                  ${plan.priceMonthly}
                  <span className="text-sm font-normal text-ink-muted">/mo</span>
                </div>
                <div className="mb-4 mt-2 text-[13px] text-ink-muted">
                  {plan.presentationsPerMonth} presentations/month
                </div>
                <Button
                  size="sm"
                  variant={isPopular ? "primary" : "secondary"}
                  className="mt-auto w-full"
                  disabled={isCurrent || loadingPlan !== null}
                  onClick={() => handleUpgrade(planId)}
                >
                  {isCurrent
                    ? "Current plan"
                    : loadingPlan === planId
                    ? "Redirecting…"
                    : `Upgrade to ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full text-center text-sm text-ink-faint hover:text-ink-muted"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
