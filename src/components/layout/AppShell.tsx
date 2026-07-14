"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Logo } from "@/components/brand/Logo";
import { useStore } from "@/lib/store";
import { cn, initials } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Misc";
import {
  IconGrid,
  IconLayers,
  IconSettings,
  IconPlus,
  IconImage,
  IconBadge,
} from "@/components/ui/icons";

const NAV = [
  { href: "/dashboard", label: "Presentations", icon: IconGrid, tour: undefined },
  { href: "/templates", label: "Templates", icon: IconLayers, tour: "sidebar-templates" },
  { href: "/images", label: "Images", icon: IconImage, tour: "sidebar-images" },
  { href: "/logos", label: "Logos", icon: IconBadge, tour: undefined },
  { href: "/settings", label: "Settings", icon: IconSettings, tour: "sidebar-settings" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, ready, logout } = useStore();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        <Spinner className="text-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-paper-soft">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-paper md:flex">
        <div className="flex h-16 items-center px-5">
          <Logo href="/dashboard" />
        </div>
        <div className="px-3">
          <ButtonLink href="/new" className="w-full" size="sm" data-tour="new-button">
            <IconPlus className="h-4 w-4" />
            New presentation
          </ButtonLink>
        </div>
        <nav className="mt-6 flex-1 space-y-0.5 px-3">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                data-tour={item.tour}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-accent-hover"
                    : "text-ink-soft hover:bg-paper-sunk hover:text-ink",
                )}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-semibold text-white">
              {initials(user.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">
                {user.name}
              </p>
              <p className="truncate text-[12px] text-ink-muted">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              router.replace("/");
            }}
            className="mt-1 w-full rounded-lg px-3 py-1.5 text-left text-[13px] text-ink-muted hover:bg-paper-sunk hover:text-ink"
          >
            Log out
          </button>
          <button
            onClick={() => import("@/lib/tour").then(({ startTour }) => startTour())}
            className="w-full px-3 py-1.5 text-left text-[12px] text-ink-faint hover:text-ink-muted"
          >
            Take a tour
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-line bg-paper px-4 md:hidden">
          <Logo href="/dashboard" />
          <ButtonLink href="/new" size="sm">
            <IconPlus className="h-4 w-4" /> New
          </ButtonLink>
        </div>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

// Page header used inside AppShell content.
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <h1 className="u-display text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
