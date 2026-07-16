import { createClient } from "@supabase/supabase-js";
import { PlanId, canGenerate } from "./plans";

export interface UserSubscription {
  planId: PlanId;
  status: string;
  presentationsUsedThisMonth: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isBillingConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// A client scoped to the calling user's own JWT (not the service role).
// auth.uid() resolves from this token, which is what the RLS policy and
// the SECURITY DEFINER functions in the user_subscriptions migration
// check against — so every operation here is confined to the caller's
// own row without needing SUPABASE_SERVICE_ROLE_KEY at all.
function scopedClient(accessToken: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

// Verifies a bearer token and returns the Supabase user it belongs to, or
// null if the token is missing/invalid. Server-side only.
export async function getAuthedUser(accessToken: string | null) {
  if (!accessToken || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await client.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}

const DEFAULT_FREE: UserSubscription = {
  planId: "free",
  status: "active",
  presentationsUsedThisMonth: 0,
};

export async function getUserSubscription(
  accessToken: string,
  userId: string,
): Promise<UserSubscription> {
  const client = scopedClient(accessToken);
  if (!client) return DEFAULT_FREE;

  // Safety net for accounts created before this table existed — the
  // signup trigger covers every new user going forward.
  try {
    await client.rpc("ensure_subscription_row", { p_user_id: userId });
    await client.rpc("reset_monthly_usage_if_needed", { p_user_id: userId });
  } catch {
    /* best-effort — fall through to whatever the row currently holds */
  }

  const { data } = await client
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return DEFAULT_FREE;

  return {
    planId: data.plan_id as PlanId,
    status: data.status,
    presentationsUsedThisMonth: data.presentations_used_this_month,
    stripeCustomerId: data.stripe_customer_id ?? undefined,
    stripeSubscriptionId: data.stripe_subscription_id ?? undefined,
  };
}

export async function incrementUsage(accessToken: string, userId: string): Promise<void> {
  const client = scopedClient(accessToken);
  if (!client) return;
  await client.rpc("increment_presentation_usage", { p_user_id: userId });
}

export async function setStripeCustomerId(
  accessToken: string,
  userId: string,
  customerId: string,
): Promise<void> {
  const client = scopedClient(accessToken);
  if (!client) return;
  await client.rpc("set_stripe_customer_id", {
    p_user_id: userId,
    p_customer_id: customerId,
  });
}

export async function checkCanGenerate(
  accessToken: string,
  userId: string,
): Promise<{ allowed: boolean; reason?: string; subscription: UserSubscription }> {
  const subscription = await getUserSubscription(accessToken, userId);
  const allowed = canGenerate(subscription.planId, subscription.presentationsUsedThisMonth);
  return { allowed, reason: allowed ? undefined : "monthly_limit_reached", subscription };
}
