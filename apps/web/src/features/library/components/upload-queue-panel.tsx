import { RefreshCw, X } from "lucide-react";
import { cn, ProgressBar } from "@lurniva/ui";
import { isSettled, UPLOAD_STAGE_META } from "../constants/upload-stages";
import type { UploadTask } from "../types";

interface UploadQueuePanelProps {
  tasks: UploadTask[];
  onRetry: (taskId: string) => void;
  onDismiss: (taskId: string) => void;
  onClearFinished: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadRow({
  task,
  onRetry,
  onDismiss,
}: {
  task: UploadTask;
  onRetry: (taskId: string) => void;
  onDismiss: (taskId: string) => void;
}) {
  const meta = UPLOAD_STAGE_META[task.stage];
  const StageIcon = meta.icon;
  // Upload progress is a real byte count; processing has no percentage the
  // backend can report, so it shows an indeterminate state instead of a fake bar.
  const showProgress = task.stage === "uploading";

  return (
    <li className="flex flex-col gap-2 rounded-control border border-border-subtle bg-surface-raised p-3.5">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-control",
            meta.chipClasses,
          )}
        >
          <StageIcon size={15} className={cn(meta.spin && "animate-spin")} />
        </span>

        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-text-heading">
            {task.label}
          </span>
          <span className="truncate text-xs text-text-faint">
            {task.sizeBytes !== null ? `${formatSize(task.sizeBytes)} · ` : ""}
            {task.stage === "uploading"
              ? `${task.progress}% uploaded`
              : meta.label}
          </span>
        </div>

        {task.stage === "failed" ? (
          <button
            type="button"
            onClick={() => onRetry(task.id)}
            className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-surface-subtle"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        ) : null}

        {isSettled(task.stage) ? (
          <button
            type="button"
            aria-label={`Dismiss ${task.label}`}
            onClick={() => onDismiss(task.id)}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle"
          >
            <X size={15} />
          </button>
        ) : null}
      </div>

      {showProgress ? (
        <ProgressBar value={task.progress} size="sm" tone="success" />
      ) : null}

      <p
        className={cn(
          "text-xs leading-relaxed",
          task.stage === "failed" ? "text-error" : "text-text-muted",
        )}
      >
        {task.stage === "failed" && task.error ? task.error : meta.message}
      </p>
    </li>
  );
}

/**
 * Live view of the upload queue. Purely presentational — every stage and
 * percentage comes from `useLibraryUpload`, which gets them from the transfer
 * itself and from the server's reported item status.
 */
export function UploadQueuePanel({
  tasks,
  onRetry,
  onDismiss,
  onClearFinished,
}: UploadQueuePanelProps) {
  if (tasks.length === 0) return null;

  const activeCount = tasks.filter((task) => !isSettled(task.stage)).length;
  const hasFinished = tasks.some((task) => task.stage === "ready");

  return (
    <section className="flex flex-col gap-3 rounded-card border border-border-subtle bg-surface-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold text-text-heading">
          {activeCount > 0
            ? `Adding ${activeCount} item${activeCount === 1 ? "" : "s"}`
            : "Recent uploads"}
        </h2>
        {hasFinished ? (
          <button
            type="button"
            onClick={onClearFinished}
            className="rounded-control px-2 py-1 text-[13px] font-semibold text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-heading"
          >
            Clear finished
          </button>
        ) : null}
      </div>

      <ul aria-live="polite" className="flex flex-col gap-2.5">
        {tasks.map((task) => (
          <UploadRow
            key={task.id}
            task={task}
            onRetry={onRetry}
            onDismiss={onDismiss}
          />
        ))}
      </ul>
    </section>
  );
}
