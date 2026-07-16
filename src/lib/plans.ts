export type PlanId = "free" | "starter" | "pro" | "business" | "unlimited";

export interface Plan {
  id: PlanId;
  name: string;
  priceMonthly: number;
  presentationsPerMonth: number; // -1 = unlimited
  maxSlides: number;
  features: string[];
  stripePriceId?: string;
  stripeProductId?: string;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    presentationsPerMonth: 1,
    maxSlides: 4,
    features: [
      "1 presentation/month",
      "4 slides max",
      "PDF export only",
      "Watermark on slides",
      "3 basic templates",
    ],
  },
  starter: {
    id: "starter",
    name: "Starter",
    priceMonthly: 9,
    presentationsPerMonth: 10,
    maxSlides: 12,
    stripePriceId: "price_1TtMJxKI6rPO26TRdRg40qWz",
    stripeProductId: "prod_Ut8b8V1bSH6WZy",
    features: [
      "10 presentations/month",
      "12 slides max",
      "PPTX + PDF export",
      "No watermark",
      "All 16 templates",
      "Stock photos",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 29,
    presentationsPerMonth: 60,
    maxSlides: 30,
    stripePriceId: "price_1TtMK7KI6rPO26TRSGVev9Gg",
    stripeProductId: "prod_Ut8bPtbua2hBC9",
    features: [
      "60 presentations/month",
      "30 slides max",
      "Brand upload",
      "Logo watermarks",
      "Own photos",
      "All languages",
      "All 20 layouts",
      "Share links",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthly: 79,
    presentationsPerMonth: 150,
    maxSlides: 30,
    stripePriceId: "price_1TtMKGKI6rPO26TRuW7FbZyv",
    stripeProductId: "prod_Ut8bpDJyOJ6vZd",
    features: [
      "150 presentations/month",
      "30 slides max",
      "Everything in Pro",
      "Unlimited logos",
      "Unlimited photos",
      "Priority support",
    ],
  },
  unlimited: {
    id: "unlimited",
    name: "Unlimited",
    priceMonthly: 0,
    presentationsPerMonth: -1,
    maxSlides: 30,
    features: ["Unlimited everything"],
  },
};

export function canGenerate(plan: PlanId, usedThisMonth: number): boolean {
  if (plan === "unlimited") return true;
  const p = PLANS[plan];
  if (p.presentationsPerMonth === -1) return true;
  return usedThisMonth < p.presentationsPerMonth;
}

export function getRemainingPresentations(plan: PlanId, usedThisMonth: number): number {
  if (plan === "unlimited") return 999;
  const p = PLANS[plan];
  if (p.presentationsPerMonth === -1) return 999;
  return Math.max(0, p.presentationsPerMonth - usedThisMonth);
}

// Looks up which plan a given Stripe price id belongs to (used by the
// webhook to map a subscription's price back to our plan ids).
export function getPlanFromPriceId(priceId: string): PlanId {
  for (const plan of Object.values(PLANS)) {
    if (plan.stripePriceId === priceId) return plan.id;
  }
  return "free";
}
