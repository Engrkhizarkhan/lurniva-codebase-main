"use client";

import { forwardRef, useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "./cn.js";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, hint, id, rows = 4, maxLength, value, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const count = typeof value === "string" ? value.length : undefined;

    return (
      <div className="grid gap-1.5">
        {label ? (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-text-body"
          >
            {label}
          </label>
        ) : null}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          value={value}
          aria-invalid={error ? true : undefined}
          className={cn(
            "w-full resize-y rounded-control border bg-surface-card px-3 py-3 text-sm text-text-body placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-1",
            error ? "border-error" : "border-border-default",
            className,
          )}
          {...props}
        />
        {error || hint || maxLength ? (
          <div className="flex items-center justify-between gap-2 text-sm">
            <p
              role={error ? "alert" : undefined}
              className={error ? "text-error" : "text-text-muted"}
            >
              {error ?? hint}
            </p>
            {maxLength ? (
              <span className="tabular-nums text-text-faint">
                {count ?? 0} / {maxLength}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";