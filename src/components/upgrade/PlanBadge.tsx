"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { PLANS, type PlanId } from "@/lib/plans";
import { UpgradeModal } from "./UpgradeModal";

interface Row {
  plan_id: PlanId;
  presentations_used_this_month: number;
}

// Shown in the dashboard header. Reads directly from user_subscriptions
// via the browser's own session — RLS scopes the row to the caller, so
// no server round trip is needed here. Renders nothing in local/demo
// mode or for the unlimited (owner) plan, per spec.
export function PlanBadge({ userId }: { userId: string }) {
  const [row, setRow] = useState<Row | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;
    supabase
      .from("user_subscriptions")
      .select("plan_id, presentations_used_this_month")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setRow(data as Row | null);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  if (!isSupabaseConfigured || !row || row.plan_id === "unlimited") return null;

  const plan = PLANS[row.plan_id];
  const limit = plan.presentationsPerMonth;
  const used = row.presentations_used_this_month;

  return (
    <>
      <button
        onClick={() => setShowUpgrade(true)}
        className="flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-ink-muted hover:border-line-strong hover:text-ink"
      >
        {plan.name}
        {limit >= 0 && (
          <span className="text-ink-faint">
            · {used}/{limit} used
          </span>
        )}
        {row.plan_id === "free" && <span className="font-semibold text-accent">Upgrade</span>}
      </button>
      <UpgradeModal
        isOpen={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        currentPlan={row.plan_id}
      />
    </>
  );
}
