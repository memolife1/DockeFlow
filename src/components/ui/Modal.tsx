"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="animate-fade-up relative w-full max-w-md rounded-xl border border-line bg-paper p-6 shadow-pop">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-ink-muted">{description}</p>
        )}
        {children && <div className="mt-4">{children}</div>}
        {footer && (
          <div className="mt-6 flex justify-end gap-2">{footer}</div>
        )}
      </div>
    </div>
  );
}
