import { WifiOff } from "lucide-react";
import { Button, cn } from "@lurniva/ui";

export interface ErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this page. Check your connection and try again.",
  actionLabel = "Refresh page",
  onAction,
  className,
}: ErrorStateProps) {
  function handleAction() {
    if (onAction) {
      onAction();
      return;
    }
    window.location.reload();
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-border-subtle bg-surface-raised px-6 py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-error-soft text-error">
        <WifiOff size={22} />
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-bold text-text-heading">{title}</h3>
        <p className="max-w-sm text-sm text-text-muted">{description}</p>
      </div>
      <Button size="sm" onClick={handleAction} className="mt-2">
        {actionLabel}
      </Button>
    </div>
  );
}
