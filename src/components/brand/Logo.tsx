import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

// The real DeckeFlow wordmark (public/brand/deckeflow-logo.png, 836x146,
// transparent background — dark navy "Decke" + blue "Flow"). Designed for
// light backgrounds, which is everywhere the app renders it.
export function Logo({
  className,
  href = "/",
  compact = false,
}: {
  className?: string;
  href?: string;
  compact?: boolean;
}) {
  const height = compact ? 18 : 22;
  const width = Math.round(height * (836 / 146));
  return (
    <Link href={href} className={cn("inline-flex items-center", className)}>
      <Image
        src="/brand/deckeflow-logo.png"
        alt="DeckeFlow"
        width={width}
        height={height}
        priority
      />
    </Link>
  );
}
