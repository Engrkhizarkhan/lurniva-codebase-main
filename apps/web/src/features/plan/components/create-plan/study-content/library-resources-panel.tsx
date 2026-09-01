import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Checkbox } from "@mantine/core";
import {
  Loader2,
  Library,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { UseLibrarySelectionResult } from "../../../hooks/useLibrarySelection";
import type { LibraryItemDto } from "../../../../library/services/library-items";

interface LibraryResourcesPanelProps {
  selection: UseLibrarySelectionResult;
}

const STATUS_LABEL: Record<LibraryItemDto["status"], string> = {
  raw: "Not processed",
  processing: "Processing",
  ready: "Ready",
  failed: "Failed",
};

function ItemRow({
  item,
  selected,
  processing,
  onToggle,
}: {
  item: LibraryItemDto;
  selected: boolean;
  processing: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const showChapters = item.status === "ready" && item.chapters.length > 0;

  return (
    <div
      className="rounded-xl border border-border-subtle bg-surface-raised transition-colors hover:bg-surface-subtle"
      style={{ opacity: processing ? 0.7 : 1 }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Checkbox checked={selected} onChange={onToggle} disabled={processing} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-text-heading">
            {item.title}
          </p>
          <p className="truncate text-xs text-text-muted">
            {showChapters
              ? `${item.chapterCount} chapter${item.chapterCount === 1 ? "" : "s"}`
              : STATUS_LABEL[item.status]}
            {item.scope === "lurniva" ? " · Lurniva" : " · Personal"}
          </p>
        </div>
        {processing ? (
          <Loader2 size={15} className="animate-spin text-color-amber-600" />
        ) : item.status === "failed" ? (
          <span
            className="inline-flex items-center rounded-full bg-color-ember-100 px-2 py-0.5 text-xs font-semibold text-color-ember-700"
            title={item.error}
          >
            Failed
          </span>
        ) : (
          <span
            className="inline-flex items-center rounded-full bg-color-forest-100 px-2 py-0.5 text-xs font-semibold text-color-forest-700"
            title={item.overview}
          >
            {item.status === "ready" ? "Ready" : STATUS_LABEL[item.status]}
          </span>
        )}
        {showChapters ? (
          <button
            type="button"
            aria-label={expanded ? "Hide chapters" : "Show chapters"}
            onClick={() => setExpanded((current) => !current)}
            className="text-text-muted transition-colors hover:text-text-heading"
          >
            {expanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        ) : null}
      </div>

      {expanded && showChapters ? (
        <ul className="grid gap-1 border-t border-border-subtle px-3 py-2">
          {item.chapters.map((chapter) => (
            <li key={chapter.id} className="flex items-start gap-2 text-sm">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-color-forest-500" />
              <span className="min-w-0 text-text-secondary">
                <span className="font-medium text-text-heading">
                  {chapter.title}
                </span>
                {chapter.topics.length > 0 ? (
                  <span className="text-text-muted">
                    {" — "}
                    {chapter.topics.join(", ")}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function LibraryResourcesPanel({
  selection,
}: LibraryResourcesPanelProps) {
  const lurniva = selection.items.filter((item) => item.scope === "lurniva");
  const personal = selection.items.filter((item) => item.scope === "personal");

  return (
    <section className="mt-6 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-text-heading">
            <Library size={16} className="text-color-forest-700" />
            Library resources
          </h2>
          <p className="mt-0.5 text-sm text-text-muted">
            Pick what to learn from — Lurniva&#39;s catalog or your own uploaded
            material. Selected resources drive chat, notes and quizzes for the
            plan&#39;s days; unprocessed items are processed automatically when
            selected. You can build a whole plan from these alone.
          </p>
        </div>
        <Link
          to="/dashboard/library"
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-control border border-border-strong px-3 py-2 text-sm font-semibold text-text-heading transition-colors hover:bg-surface-subtle"
        >
          <ExternalLink size={14} />
          Open library
        </Link>
      </div>

      {selection.isLoading ? (
        <p className="text-sm text-text-muted">Loading library…</p>
      ) : lurniva.length === 0 && personal.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <BookOpen size={15} />
          Nothing in your library yet. Open the Library page to add your own
          PDFs or Word documents.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {lurniva.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-text-faint">
                Lurniva
              </h3>
              {lurniva.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  selected={selection.selectedIds.includes(item.id)}
                  processing={selection.processingIds.includes(item.id)}
                  onToggle={() => selection.toggleItem(item.id)}
                />
              ))}
            </div>
          ) : null}

          {personal.length > 0 ? (
            <div className="grid gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wide text-text-faint">
                Personal
              </h3>
              {personal.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  selected={selection.selectedIds.includes(item.id)}
                  processing={selection.processingIds.includes(item.id)}
                  onToggle={() => selection.toggleItem(item.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}