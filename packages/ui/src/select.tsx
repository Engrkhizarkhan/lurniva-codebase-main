"use client";

import { forwardRef, useId } from "react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "./cn.js";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;

    return (
      <div className="grid gap-1.5">
        {label ? (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-text-body"
          >
            {label}
          </label>
        ) : null}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 w-full rounded-control border bg-surface-card px-3 text-sm text-text-body focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-1",
            error ? "border-error" : "border-border-default",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? (
          <p role="alert" className="text-sm text-error">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = "Select";