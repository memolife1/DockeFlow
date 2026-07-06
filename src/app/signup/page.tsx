"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/marketing/AuthLayout";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Misc";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useStore } from "@/lib/store";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export default function SignupPage() {
  const { signup } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setError("");
    setNotice("");
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { name: form.name.trim(), company: form.company.trim() || null },
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/dashboard`
                : undefined,
          },
        });
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        // If email confirmation is required, there is no session yet.
        if (data.session) {
          router.push("/dashboard");
        } else {
          setNotice("Check your email to confirm your account, then log in.");
          setLoading(false);
        }
      } else {
        await new Promise((r) => setTimeout(r, 500));
        signup(form.name.trim(), form.email.trim(), form.company.trim() || undefined);
        router.push("/dashboard");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      heading="Create your account"
      sub="Start turning notes and topics into client-ready decks."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            required
            autoFocus
            placeholder="Alex Rivera"
            value={form.name}
            onChange={set("name")}
          />
        </Field>
        <Field label="Work email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={set("email")}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="password"
          hint={isSupabaseConfigured ? "At least 6 characters" : "Not stored in demo mode"}
        >
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required={isSupabaseConfigured}
            minLength={isSupabaseConfigured ? 6 : undefined}
            value={form.password}
            onChange={set("password")}
          />
        </Field>
        <Field label="Company" htmlFor="company" hint="Optional">
          <Input
            id="company"
            placeholder="Acme Inc."
            value={form.company}
            onChange={set("company")}
          />
        </Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {notice && <p className="text-sm text-emerald-600">{notice}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Create account"}
        </Button>
      </form>
      <GoogleButton label="Sign up with Google" />
      <p className="mt-6 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
