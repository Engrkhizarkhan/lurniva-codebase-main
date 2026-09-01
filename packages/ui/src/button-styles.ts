import { cn } from "./cn.js";

// Deliberately not "use client": this is pure class-name computation with
// no React/DOM dependency, so it needs to stay callable from plain Server
// Component code too (e.g. a Next.js `<a>`-based CTA link that mirrors the
// Button's look). Keeping it out of button.tsx's "use client" module is
// what makes that possible — everything a "use client" file exports is
// treated as a client-only reference, even a plain function like this one.

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "accent"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-text-on-primary hover:bg-primary-hover",
  secondary: "bg-secondary text-text-on-primary hover:bg-secondary-hover",
  outline:
    "bg-transparent text-text-heading border border-border-strong hover:bg-surface-subtle",
  accent: "bg-accent text-text-on-accent hover:bg-accent-hover",
  ghost: "bg-transparent text-text-body hover:bg-surface-subtle",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2",
};

export interface ButtonClassNameOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/**
 * The Button's look, as a class string, decoupled from the `<button>` element
 * itself — lets call sites that must render a different tag (an `<a>` for a
 * navigating CTA, since a `<button>` can't legally nest inside a link) reuse
 * the exact same visual language instead of re-deriving it.
 */
export function buttonClassNames({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonClassNameOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center rounded-control font-semibold transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "w-auto",
    className,
  );
}
