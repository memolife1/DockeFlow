import { cn } from "@/lib/utils";

const inputBase =
  "w-full rounded-lg border border-line-strong bg-paper px-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-ring";

export function Label({
  children,
  hint,
  htmlFor,
}: {
  children: React.ReactNode;
  hint?: string;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 flex items-baseline justify-between">
      <span className="text-[13px] font-medium text-ink-soft">{children}</span>
      {hint && <span className="text-[12px] text-ink-faint">{hint}</span>}
    </label>
  );
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor} hint={hint}>
          {label}
        </Label>
      )}
      {children}
    </div>
  );
}

export function Input({
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputBase, "h-10", className)} {...rest} />;
}

export function Textarea({
  className,
  ...rest
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(inputBase, "py-2.5 leading-relaxed", className)} {...rest} />
  );
}

export function Select({
  className,
  children,
  ...rest
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputBase, "h-10 pr-8", className)} {...rest}>
      {children}
    </select>
  );
}
