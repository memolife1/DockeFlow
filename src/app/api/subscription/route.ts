import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";
import { isBillingConfigured, getUserSubscription } from "@/lib/subscription";
import { requireAuth } from "@/lib/auth/requireAuth";

export const runtime = "nodejs";

// Local/demo mode (no Supabase configured) has no accounts or limits at
// all today, so every feature stays unlocked — matches how the rest of
// the app behaves without a backend.
const UNRESTRICTED = {
  planId: "unlimited" as const,
  planName: "Unlimited",
  presentationsUsed: 0,
  presentationsLimit: -1,
  maxSlides: PLANS.unlimited.maxSlides,
  features: { pptxExport: true, brandUpload: true, watermark: false, allTemplates: true },
};

export async function GET(req: Request) {
  if (!isBillingConfigured) {
    return NextResponse.json(UNRESTRICTED);
  }

  const auth = await requireAuth(req);
  if (auth.error) return auth.error;
  const { user, token } = auth;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await getUserSubscription(token, user.id);
  const plan = PLANS[subscription.planId];
  const isFree = subscription.planId === "free";

  return NextResponse.json({
    planId: subscription.planId,
    planName: plan.name,
    presentationsUsed: subscription.presentationsUsedThisMonth,
    presentationsLimit: plan.presentationsPerMonth,
    maxSlides: plan.maxSlides,
    features: {
      pptxExport: !isFree,
      brandUpload: subscription.planId === "pro" || subscription.planId === "business" || subscription.planId === "unlimited",
      watermark: isFree,
      allTemplates: !isFree,
    },
  });
}
