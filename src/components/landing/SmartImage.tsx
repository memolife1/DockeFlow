"use client";

import { useState } from "react";
import Image from "next/image";

// The user drops real screenshots into public/assets/<name> at their own
// pace; until a given file exists this renders a labeled gradient card
// instead of a broken image icon.
interface SmartImageProps {
  src: string;
  alt: string;
  label?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

export function SmartImage({
  src,
  alt,
  label,
  fill,
  width,
  height,
  sizes,
  priority,
  className,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`lp-img-fallback ${className ?? ""}`} role="img" aria-label={alt}>
        <span>{label ?? alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : (width ?? 800)}
      height={fill ? undefined : (height ?? 600)}
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
