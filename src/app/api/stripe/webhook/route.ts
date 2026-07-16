import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getPlanFromPriceId } from "@/lib/plans";

export const runtime = "nodejs";

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  return key ? new Stripe(key) : null;
}

// The webhook has no per-user session — Stripe calls it server-to-server
// — so it's the one place in this feature that genuinely needs elevated
// access to write an arbitrary user's row. The service role key bypasses
// RLS entirely, which is appropriate here only because the request was
// already authenticated via the Stripe signature check below.
function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function getUserId(obj: { metadata?: Stripe.Metadata | null }) {
  return obj.metadata?.supabase_user_id;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabase = getServiceClient();

  if (!stripe || !webhookSecret || !supabase) {
    return NextResponse.json(
      { error: "Billing webhook isn't fully configured yet." },
      { status: 501 },
    );
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = getUserId(session);
      if (!userId || !session.subscription) break;
      const sub = await stripe.subscriptions.retrieve(session.subscription as string);
      const priceId = sub.items.data[0]?.price.id;
      const planId = priceId ? getPlanFromPriceId(priceId) : "free";
      await supabase
        .from("user_subscriptions")
        .update({
          plan_id: planId,
          status: "active",
          stripe_subscription_id: sub.id,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .neq("plan_id", "unlimited");
      break;
    }
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = getUserId(sub);
      if (!userId) break;
      const priceId = sub.items.data[0]?.price.id;
      const planId = priceId ? getPlanFromPriceId(priceId) : "free";
      await supabase
        .from("user_subscriptions")
        .update({ plan_id: planId, status: sub.status, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .neq("plan_id", "unlimited");
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = getUserId(sub);
      if (!userId) break;
      await supabase
        .from("user_subscriptions")
        .update({
          plan_id: "free",
          status: "active",
          stripe_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .neq("plan_id", "unlimited");
      break;
    }
  }

  return NextResponse.json({ received: true });
}
