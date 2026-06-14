import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 font-medium rounded-full transition disabled:opacity-40 disabled:cursor-not-allowed focus-ring";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-paper hover:bg-stone-800",
  secondary: "border border-line bg-paper text-ink hover:bg-paper-sunken",
  ghost: "text-ink-muted hover:text-ink hover:bg-paper-sunken",
  danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
};

const sizes: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5",
  md: "text-sm px-3.5 py-2",
  lg: "text-base px-5 py-3",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
