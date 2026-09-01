"use client";

import type { ReactNode } from "react";
import { cn } from "./cn.js";

export interface CardProps {
  children: ReactNode;
  dark?: boolean;
  interactive?: boolean;
  onClick?: () => void;
  footer?: ReactNode;
  className?: string;
  accentClassName?: string;
}

/** The generic surface every card-shaped block in the product and marketing site sits on. */
export function Card({
  children,
  dark = false,
  interactive = false,
  onClick,
  footer,
  className,
  accentClassName,
}: CardProps) {
  const Tag = interactive ? "button" : "div";

  return (
    <Tag
      type={interactive ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "flex flex-col rounded-card p-6 text-left transition-shadow",
        dark
          ? "border border-transparent bg-surface-inverse text-cream-100"
          : "border border-border-subtle bg-surface-card text-text-body shadow-sm",
        interactive && !dark ? "hover:border-border-default hover:shadow-md" : undefined,
        accentClassName,
        className,
      )}
    >
      <div className="flex-1">{children}</div>
      {footer ? (
        <div
          className={cn(
            "mt-4 border-t pt-4",
            dark ? "border-cream-100/[0.14]" : "border-border-subtle",
          )}
        >
          {footer}
        </div>
      ) : null}
    </Tag>
  );
}