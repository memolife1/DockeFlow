"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/marketing/AuthLayout";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Misc";
import { useStore } from "@/lib/store";

export default function LoginPage() {
  const { login } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    // Simulated auth latency for a believable flow.
    setTimeout(() => {
      login(email.trim());
      router.push("/dashboard");
    }, 500);
  };

  return (
    <AuthLayout
      heading="Log in to DeckeFlow"
      sub="Pick up where you left off. Enter your email to continue."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Work email" htmlFor="email">
          <Input
            id="email"
            type="email"
            required
            autoFocus
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor="pw" hint="Not checked in this demo">
          <Input id="pw" type="password" placeholder="••••••••" />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : "Log in"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
