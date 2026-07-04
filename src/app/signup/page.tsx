"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/marketing/AuthLayout";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Misc";
import { useStore } from "@/lib/store";

export default function SignupPage() {
  const { signup } = useStore();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setLoading(true);
    setTimeout(() => {
      signup(form.name.trim(), form.email.trim(), form.company.trim() || undefined);
      router.push("/dashboard");
    }, 600);
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
        <Field label="Company" htmlFor="company" hint="Optional">
          <Input
            id="company"
            placeholder="Acme Inc."
            value={form.company}
            onChange={set("company")}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}
