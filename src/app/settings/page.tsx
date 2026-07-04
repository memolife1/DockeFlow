"use client";

import { useEffect, useState } from "react";
import { AppShell, PageHeader } from "@/components/layout/AppShell";
import { Card, Divider } from "@/components/ui/Misc";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";
import { IconCheck } from "@/components/ui/icons";

export default function SettingsPage() {
  const { user, updateUser, presentations, styleRefs } = useStore();
  const [form, setForm] = useState({ name: "", email: "", company: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user)
      setForm({
        name: user.name,
        email: user.email,
        company: user.company ?? "",
      });
  }, [user]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({
      name: form.name,
      email: form.email,
      company: form.company || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <PageHeader
          title="Settings"
          subtitle="Manage your account details and preferences."
        />

        <div className="mt-8 grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <h2 className="text-sm font-semibold text-ink">Profile</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              This information appears on your account.
            </p>
          </div>
          <Card className="col-span-3 p-6 sm:col-span-2">
            <form onSubmit={save} className="space-y-4">
              <Field label="Full name" htmlFor="name">
                <Input id="name" value={form.name} onChange={set("name")} />
              </Field>
              <Field label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                />
              </Field>
              <Field label="Company" htmlFor="company" hint="Optional">
                <Input
                  id="company"
                  value={form.company}
                  onChange={set("company")}
                />
              </Field>
              <div className="flex items-center gap-3 pt-1">
                <Button type="submit">Save changes</Button>
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-emerald-600">
                    <IconCheck className="h-4 w-4" /> Saved
                  </span>
                )}
              </div>
            </form>
          </Card>
        </div>

        <Divider className="my-10" />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <h2 className="text-sm font-semibold text-ink">Workspace</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              A snapshot of your activity.
            </p>
          </div>
          <div className="col-span-3 grid grid-cols-3 gap-4 sm:col-span-2">
            {[
              ["Presentations", presentations.length],
              ["Uploaded styles", styleRefs.length],
              ["Member since", user ? formatDate(user.createdAt) : "—"],
            ].map(([label, value]) => (
              <Card key={label as string} className="p-4">
                <p className="text-[12px] text-ink-muted">{label}</p>
                <p className="mt-1 text-lg font-semibold text-ink">{value}</p>
              </Card>
            ))}
          </div>
        </div>

        <Divider className="my-10" />

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <h2 className="text-sm font-semibold text-ink">Plan</h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              Billing is out of scope for this MVP.
            </p>
          </div>
          <Card className="col-span-3 flex items-center justify-between p-6 sm:col-span-2">
            <div>
              <p className="text-sm font-semibold text-ink">Early access</p>
              <p className="text-[13px] text-ink-muted">
                Unlimited presentations during the demo.
              </p>
            </div>
            <Button variant="secondary" disabled>
              Manage plan
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
