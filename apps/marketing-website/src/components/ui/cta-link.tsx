import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { buttonClassNames } from "@lurniva/ui";
import type { ButtonSize, ButtonVariant } from "@lurniva/ui";

export interface CtaLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconAfter?: ReactNode;
}

/**
 * A navigating call-to-action styled exactly like `Button` from `@lurniva/ui`.
 * Exists because a `<button>` can't be nested inside an `<a>` — every CTA on
 * this marketing site that scrolls or routes somewhere uses this instead of
 * <Button>, sharing its class computation via `buttonClassNames`.
 */
export function CtaLink({
  variant,
  size,
  fullWidth,
  icon,
  iconAfter,
  className,
  children,
  ...props
}: CtaLinkProps) {
  return (
    <Link
      className={buttonClassNames({ variant, size, fullWidth, className })}
      {...props}
    >
      {icon}
      {children}
      {iconAfter}
    </Link>
  );
}
