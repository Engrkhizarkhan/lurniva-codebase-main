import { useMemo, useState } from "react";
import { Bookmark, NotebookPen, Quote, Trash2 } from "lucide-react";
import { cn } from "@lurniva/ui";
import { EmptyState } from "~/shared/components/empty-state";
import { ErrorState } from "~/shared/components/error-state";
import { SkeletonLoading } from "~/shared/components/skeleton-loading";
import { NOTE_CATEGORIES } from "../../day-study/constants/note-categories";
import type { NoteCategory, StudyNote } from "../../day-study/types";
import { useDeleteStudyNote, useStudyNotes } from "../hooks/useNotes";

/** "3 min ago" / "Tue" / "12 Mar" — recency at a glance, not a full timestamp. */
function formatRelativeDate(iso: string): string {
  const then = new Date(iso);
  const minutes = Math.floor((Date.now() - then.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return then.toLocaleDateString([], { weekday: "short" });
  return then.toLocaleDateString([], { day: "numeric", month: "short" });
}

const UNKNOWN_CATEGORY: NoteCategory = {
  id: "unknown",
  label: "Other",
  description: "",
  icon: Bookmark,
  color: "var(--color-sand-400)",
};

function categoryOf(categoryId: string) {
  return NOTE_CATEGORIES.find((category) => category.id === categoryId) ?? UNKNOWN_CATEGORY;
}

interface FilterChipsProps {
  notes: StudyNote[];
  active: string | null;
  onChange: (categoryId: string | null) => void;
}

/** All + one chip per category actually in use, so an empty category never shows. */
function FilterChips({ notes, active, onChange }: FilterChipsProps) {
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const note of notes) map.set(note.categoryId, (map.get(note.categoryId) ?? 0) + 1);
    return map;
  }, [notes]);

  const usedCategories = NOTE_CATEGORIES.filter((category) => counts.has(category.id));

  return (
    <div role="tablist" aria-label="Filter by category" className="flex flex-wrap gap-2">
      <button
        type="button"
        role="tab"
        aria-selected={active === null}
        onClick={() => onChange(null)}
        className={cn(
          "rounded-pill border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150",
          active === null
            ? "border-forest-900 bg-forest-900 text-cream-100"
            : "border-border-default bg-white text-text-body hover:bg-surface-sunken",
        )}
      >
        All <span className="tabular-nums opacity-70">({notes.length})</span>
      </button>
      {usedCategories.map((category) => {
        const selected = active === category.id;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(selected ? null : category.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-pill border px-3.5 py-1.5 text-sm font-semibold transition-colors duration-150",
              selected
                ? "border-transparent text-forest-900"
                : "border-border-default bg-white text-text-body hover:bg-surface-sunken",
            )}
            style={selected ? { background: category.color } : undefined}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ background: category.color }}
            />
            {category.label}
            <span className="tabular-nums opacity-70">({counts.get(category.id)})</span>
          </button>
        );
      })}
    </div>
  );
}

function NoteCard({
  note,
  onDelete,
  isDeleting,
}: {
  note: StudyNote;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const category = categoryOf(note.categoryId);

  return (
    <div className="group relative flex flex-col gap-2.5 rounded-card border border-border-subtle bg-surface-card p-4 shadow-sm">
      <Quote size={16} className="shrink-0" style={{ color: category.color }} />
      <p className="text-sm leading-relaxed text-text-body">{note.text}</p>
      <div className="mt-auto flex items-center gap-1.5 pt-1 text-xs text-text-faint">
        {note.sourceLabel ? (
          <>
            <span className="min-w-0 truncate">{note.sourceLabel}</span>
            <span aria-hidden>·</span>
          </>
        ) : null}
        <span className="shrink-0">{formatRelativeDate(note.createdAt)}</span>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        aria-label="Delete note"
        className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-md text-text-faint opacity-0 transition-opacity duration-150 hover:bg-error-soft hover:text-error focus-visible:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

function NoteCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-card border border-border-subtle bg-surface-card p-4 shadow-sm">
      <SkeletonLoading className="size-4 rounded-full" />
      <SkeletonLoading className="h-3.5 w-full" />
      <SkeletonLoading className="h-3.5 w-3/4" />
      <SkeletonLoading className="mt-2 h-3 w-1/3" />
    </div>
  );
}

/**
 * Every note the student has highlighted from the AI document editor (or
 * saved whole from a chat answer), grouped by the category they filed it
 * under — the same categories the editor's selection menu offers.
 */
export function MyNotesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const notesQuery = useStudyNotes();
  const deleteNote = useDeleteStudyNote();

  const notes = notesQuery.data ?? [];
  const visible = activeCategory
    ? notes.filter((note) => note.categoryId === activeCategory)
    : notes;

  const groups = NOTE_CATEGORIES.map((category) => ({
    category,
    notes: visible.filter((note) => note.categoryId === category.id),
  })).filter((group) => group.notes.length > 0);

  // A note filed under a category this list doesn't know about still shows,
  // grouped under "Other" rather than silently dropped.
  const unknownNotes = visible.filter(
    (note) => !NOTE_CATEGORIES.some((category) => category.id === note.categoryId),
  );
  if (unknownNotes.length > 0) {
    groups.push({ category: UNKNOWN_CATEGORY, notes: unknownNotes });
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:px-8">
      <div className="grid gap-1.5">
        <h1 className="font-display text-2xl font-extrabold tracking-[-0.01em] text-text-heading">
          My Notes
        </h1>
        <p className="text-sm text-text-muted">
          Everything you have highlighted or saved while studying, grouped by category.
        </p>
      </div>

      {notesQuery.isLoading ? (
        <div className="grid gap-6">
          <div className="flex gap-2">
            <SkeletonLoading className="h-8 w-16 rounded-pill" />
            <SkeletonLoading className="h-8 w-24 rounded-pill" />
            <SkeletonLoading className="h-8 w-28 rounded-pill" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <NoteCardSkeleton key={key} />
            ))}
          </div>
        </div>
      ) : notesQuery.isError ? (
        <ErrorState
          description="We couldn't load your notes. Check your connection and try again."
          onAction={() => void notesQuery.refetch()}
        />
      ) : notes.length === 0 ? (
        <EmptyState
          icon={<NotebookPen size={22} />}
          title="No notes yet"
          description="Highlight text in the AI study workspace, or save an answer, and it will show up here."
        />
      ) : (
        <div className="grid gap-6">
          <FilterChips notes={notes} active={activeCategory} onChange={setActiveCategory} />

          {visible.length === 0 ? (
            <p className="rounded-card border border-dashed border-border-subtle bg-surface-raised px-6 py-10 text-center text-sm text-text-muted">
              No notes in this category yet.
            </p>
          ) : (
            groups.map(({ category, notes: groupNotes }) => (
              <section key={category.id} className="grid gap-3">
                <h2 className="flex items-center gap-2 text-sm font-bold text-text-heading">
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: category.color }}
                  />
                  {category.label}
                  <span className="text-xs font-medium text-text-faint">
                    {groupNotes.length}
                  </span>
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {groupNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onDelete={() => deleteNote.mutate(note.id)}
                      isDeleting={deleteNote.isPending && deleteNote.variables === note.id}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}
    </div>
  );
}
