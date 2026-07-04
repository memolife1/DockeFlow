import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper-soft/80 backdrop-blur">
      <div className="u-container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex">
            {[
              ["How it works", "#how"],
              ["Templates", "#templates"],
              ["Use cases", "#usecases"],
            ].map(([label, href]) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-ink-soft transition-colors hover:text-ink"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden px-3 text-sm font-medium text-ink-soft hover:text-ink sm:block"
          >
            Log in
          </Link>
          <ButtonLink href="/signup" size="sm">
            Start free
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
