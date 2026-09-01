import {
  BookOpen,
  FileText,
  Loader2,
  NotebookPen,
  RefreshCw,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { LibraryStatus } from "@lurniva/validation";
import type { LibraryItemDto } from "../services/library-items";

interface LibraryItemCardProps {
  item: LibraryItemDto;
  onRemove: (itemId: string) => void;
  onReprocess: (itemId: string) => void;
  busy?: boolean;
}

const STATUS_LABEL: Record<LibraryStatus, string> = {
  raw: "Not processed",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

const STATUS_CLASSES: Record<LibraryStatus, string> = {
  raw: "bg-surface-subtle text-text-muted",
  processing: "bg-warning-soft text-color-amber-600",
  ready: "bg-success-soft text-success",
  failed: "bg-error-soft text-error",
};

/** The document tile: the source we distilled the item from, at a glance. */
const SOURCE_ICON: Record<string, LucideIcon> = {
  catalog: BookOpen,
  pdf: FileText,
  docx: FileText,
  doc: FileText,
  text: NotebookPen,
};

function StatusBadge({ status }: { status: LibraryStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold",
        STATUS_CLASSES[status],
      )}
    >
      {status === "processing" ? (
        <Loader2 size={11} className="animate-spin" />
      ) : null}
      {STATUS_LABEL[status]}
    </span>
  );
}

export function LibraryItemCard({
  item,
  onRemove,
  onReprocess,
  busy = false,
}: LibraryItemCardProps) {
  const isPlatform = item.scope === "lurniva";
  const SourceIcon = SOURCE_ICON[item.sourceType] ?? FileText;
  const summary = item.overview ?? item.description;

  return (
    <article className="flex flex-col gap-3.5 rounded-card border border-border-subtle bg-surface-card p-5 shadow-sm transition-shadow duration-150 hover:shadow-md">
      <div className="flex items-start gap-3.5">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-control",
            isPlatform
              ? "bg-accent-soft text-primary"
              : "bg-surface-subtle text-primary",
          )}
        >
          <SourceIcon size={20} />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="truncate font-display text-[17px] font-bold text-text-heading">
            {item.title}
          </h3>
          <p className="truncate text-[13px] text-text-muted">
            {isPlatform ? "Lurniva" : (item.fileName ?? "Pasted content")}
          </p>
        </div>

        <StatusBadge status={item.status} />
      </div>

      {summary ? (
        <p className="line-clamp-2 min-h-10 text-[13px] leading-relaxed text-text-muted">
          {summary}
        </p>
      ) : (
        <p className="min-h-10 text-[13px] leading-relaxed text-text-faint">
          {item.status === "processing"
            ? "We're preparing this content for AI study."
            : "No summary yet."}
        </p>
      )}

      {item.status === "ready" && item.chapterCount > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {item.chapters.slice(0, 3).map((chapter) => (
            <span
              key={chapter.id}
              title={chapter.topics.join(", ")}
              className="max-w-45 truncate rounded-pill border border-border-subtle bg-surface-raised px-2.5 py-0.5 text-xs text-text-muted"
            >
              {chapter.title}
            </span>
          ))}
          {item.chapterCount > 3 ? (
            <span className="rounded-pill border border-border-subtle bg-surface-raised px-2.5 py-0.5 text-xs text-text-faint">
              +{item.chapterCount - 3} more
            </span>
          ) : null}
        </div>
      ) : null}

      {item.status === "failed" && item.error ? (
        <p className="line-clamp-2 text-xs text-error">{item.error}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border-subtle pt-3">
        <span className="text-[13px] font-semibold text-text-heading">
          {item.status === "ready"
            ? `${item.chapterCount} chapter${item.chapterCount === 1 ? "" : "s"}`
            : STATUS_LABEL[item.status]}
        </span>

        <div className="flex items-center gap-1">
          {item.status !== "ready" ? (
            <button
              type="button"
              disabled={busy || item.status === "processing"}
              onClick={() => onReprocess(item.id)}
              className="inline-flex items-center gap-1.5 rounded-control px-2.5 py-1.5 text-[13px] font-semibold text-primary transition-colors hover:bg-surface-subtle disabled:opacity-50"
            >
              <RefreshCw size={14} />
              {item.status === "failed" ? "Try again" : "Process now"}
            </button>
          ) : null}
          {!isPlatform ? (
            <button
              type="button"
              aria-label={`Remove ${item.title}`}
              disabled={busy}
              onClick={() => onRemove(item.id)}
              className="inline-flex size-8 items-center justify-center rounded-control text-text-muted transition-colors hover:bg-surface-subtle hover:text-error disabled:opacity-50"
            >
              <Trash2 size={15} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}
