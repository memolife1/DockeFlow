"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "./supabase";
import type { PlanId } from "./plans";

export interface SubscriptionInfo {
  planId: PlanId;
  planName: string;
  presentationsUsed: number;
  presentationsLimit: number; // -1 = unlimited
  maxSlides: number;
  features: {
    pptxExport: boolean;
    brandUpload: boolean;
    watermark: boolean;
    allTemplates: boolean;
  };
}

const UNRESTRICTED: SubscriptionInfo = {
  planId: "unlimited",
  planName: "Unlimited",
  presentationsUsed: 0,
  presentationsLimit: -1,
  maxSlides: 30,
  features: { pptxExport: true, brandUpload: true, watermark: false, allTemplates: true },
};

// Single source of truth for "what can this user do" on the client —
// used by the export dialog, the templates gallery, and the dashboard
// plan badge. Falls back to fully unrestricted in local/demo mode.
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionInfo>(UNRESTRICTED);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase!.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const res = await fetch("/api/subscription", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok && active) setSubscription(await res.json());
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { subscription, loading };
}
