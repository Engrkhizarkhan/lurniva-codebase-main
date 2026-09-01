import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { Button, cn } from "@lurniva/ui";

export interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-surface-raised px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-sunken text-text-faint">
        {icon ?? <Inbox size={22} />}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-text-heading">{title}</h3>
        {description ? (
          <p className="max-w-sm text-sm text-text-muted">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
