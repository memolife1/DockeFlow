import { NextResponse } from "next/server";
import Stripe from "stripe";
import { PLANS } from "@/lib/plans";
import { getAuthedUser, getUserSubscription, setStripeCustomerId } from "@/lib/subscription";

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
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace(/^Bearer\s+/i, "") ?? null;
  const user = await getAuthedUser(token);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
