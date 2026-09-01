"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { buttonClassNames } from "./button-styles.js";
import type { ButtonSize, ButtonVariant } from "./button-styles.js";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconAfter?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidth = false,
      icon,
      iconAfter,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={buttonClassNames({ variant, size, fullWidth, className })}
        {...props}
      >
        {icon}
        {children}
        {iconAfter}
      </button>
    );
  },
);
Button.displayName = "Button";
