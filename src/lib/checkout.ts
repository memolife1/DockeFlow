import { supabase } from "./supabase";

// Shared by the upgrade modal, the dashboard's post-signup redirect, and
// the landing page's logged-in pricing CTAs. Redirects to Stripe Checkout
// on success; returns an error message on failure (never throws).
export async function startCheckout(priceId: string): Promise<string | null> {
  if (!supabase) return "Sign in to upgrade your plan.";
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return "Sign in to upgrade your plan.";

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ priceId }),
    });
    const json = await res.json();
    if (json.url) {
      window.location.href = json.url;
      return null;
    }
    return json.error ?? "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}
