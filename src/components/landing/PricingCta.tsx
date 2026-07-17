"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { startCheckout } from "@/lib/checkout";

export function PricingCta({
  planId,
  priceId,
  href,
  label,
  highlight,
}: {
  planId: string;
  priceId?: string;
  href: string;
  label: string;
  highlight?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const style = highlight
    ? { background: "var(--accent)", color: "#fff" }
    : { background: "var(--bg)", color: "var(--ink)", border: "1px solid var(--line)" };

  // Free plan (or billing not configured) is always just a link to signup.
  if (!priceId || !isSupabaseConfigured) {
    return (
      <Link
        href={href}
        className="mt-6 rounded-full px-4 py-3 text-center text-sm font-bold transition-transform hover:scale-[1.02]"
        style={style}
      >
        {label}
      </Link>
    );
  }

  const handleClick = async () => {
    setLoading(true);
    const { data } = await supabase!.auth.getUser();
    if (data.user) {
      // Already signed in — skip signup and go straight to checkout.
      const error = await startCheckout(priceId);
      if (error) setLoading(false);
    } else {
      router.push(href);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-6 rounded-full px-4 py-3 text-center text-sm font-bold transition-transform hover:scale-[1.02] disabled:opacity-60"
      style={style}
    >
      {loading ? "Loading…" : label}
    </button>
  );
}
