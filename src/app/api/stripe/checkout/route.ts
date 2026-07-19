import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS } from "@/lib/plans";
import { getUserSubscription, setStripeCustomerId } from "@/lib/subscription";
import { requireAuth } from "@/lib/auth/requireAuth";
import { rateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

const KNOWN_PRICE_IDS = new Set(
  Object.values(PLANS)
    .map((p) => p.stripePriceId)
    .filter((id): id is string => Boolean(id)),
);

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Billing isn't configured yet (missing STRIPE_SECRET_KEY)." },
      { status: 501 },
    );
  }

  let body: { priceId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { priceId } = body;
  if (!priceId || !KNOWN_PRICE_IDS.has(priceId)) {
    return NextResponse.json({ error: "Unknown price" }, { status: 400 });
  }

  // Identify the caller from their own session token — never trust a
  // client-supplied userId/email for who's being charged.
  const auth = await requireAuth(req, { strict: true });
  if (auth.error) return auth.error;
  const { user, token } = auth;

  // Max 5 checkout attempts per 5 minutes per user.
  const rl = rateLimit(`checkout:${user.id}`, 5, 300);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many checkout attempts. Please wait and try again." },
      { status: 429, headers: { "Retry-After": String(rl.resetIn) } },
    );
  }

  const existing = token ? await getUserSubscription(token, user.id) : null;
  let customerId = existing?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    if (token) await setStripeCustomerId(token, user.id, customerId).catch(() => {});
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.deckeflow.com";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=true`,
    cancel_url: `${baseUrl}/dashboard?cancelled=true`,
    metadata: { supabase_user_id: user.id },
    subscription_data: { metadata: { supabase_user_id: user.id } },
  });

  return NextResponse.json({ url: session.url });
}
