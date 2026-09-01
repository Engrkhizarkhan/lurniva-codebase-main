"use client";

import { forwardRef, useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./cn.js";

export type InputSize = "sm" | "md";

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> {
  label?: string;
  icon?: ReactNode;
  error?: string;
  size?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "h-10 text-sm",
  md: "h-11 text-sm",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, error, size = "md", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="grid gap-1.5">
        {label ? (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-body"
          >
            {label}
          </label>
        ) : null}
        <div className="relative flex items-center">
          {icon ? (
            <span className="pointer-events-none absolute left-3 bottom-4 flex items-center text-text-faint">
              {icon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            className={cn(
              "w-full rounded-control border bg-surface-card px-3 text-text-body placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-1",
              icon ? "pl-10" : undefined,
              error ? "border-error" : "border-border-default",
              sizeClasses[size],
              className,
            )}
            {...props}
          />
        </div>
        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";