import { BookmarkPlus, X } from "lucide-react";
import { NOTE_CATEGORIES } from "../../constants/note-categories";
import type { NoteCategory } from "../../types";

export interface SelectionAnchor {
  top: number;
  left: number;
}

interface NoteSelectionMenuProps {
  selectedText: string;
  anchor: SelectionAnchor;
  onAddToNotes: (category: NoteCategory) => void;
  onDismiss: () => void;
}

const MENU_WIDTH = 300;
const PREVIEW_LIMIT = 100;

interface CategoryRowProps {
  category: NoteCategory;
  onSelect: (category: NoteCategory) => void;
}

const CategoryRow = ({ category, onSelect }: CategoryRowProps) => {
  const Icon = category.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(category)}
      className="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-[var(--surface-sunken)]"
    >
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
        style={{
          background: category.color,
          color: "var(--color-forest-800)",
        }}
      >
        <Icon size={15} />
      </span>

      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--text-heading)]">
        {category.label}
      </span>

      <span className="text-[11px] text-[var(--text-faint)] opacity-0 transition-opacity group-hover:opacity-100">
        Add
      </span>
    </button>
  );
};

const NoteSelectionMenu = ({
  selectedText,
  anchor,
  onAddToNotes,
  onDismiss,
}: NoteSelectionMenuProps) => {
  const preview =
    selectedText.length > PREVIEW_LIMIT
      ? `${selectedText.slice(0, PREVIEW_LIMIT).trimEnd()}…`
      : selectedText;

  return (
    <div
      role="dialog"
      aria-label="Add selected text to notes"
      onMouseDown={(event) => event.preventDefault()}
      className="absolute z-30 flex flex-col overflow-hidden rounded-xl border bg-white shadow-[var(--shadow-lg)]"
      style={{
        top: anchor.top,
        left: anchor.left,
        width: MENU_WIDTH,
        borderColor: "var(--border-subtle)",
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-3.5 py-3">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
          style={{
            background: "var(--role-ai-soft)",
            color: "var(--color-forest-700)",
          }}
        >
          <BookmarkPlus size={15} />
        </span>

        <div className="min-w-0 flex-1">
          <div
            className="text-[13px] font-semibold"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--text-heading)",
            }}
          >
            Add to notes
          </div>

          <div className="text-[11px] text-[var(--text-muted)]">
            Choose a category
          </div>
        </div>

        <button
          type="button"
          aria-label="Dismiss"
          onClick={onDismiss}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-sunken)] hover:text-[var(--text-body)]"
        >
          <X size={15} />
        </button>
      </div>

      {/* Selected text */}
      <div className="mx-3.5 rounded-md bg-[var(--role-ai-soft)] px-3 py-2">
        <p
          className="m-0 line-clamp-2 text-[12px] leading-[1.45] text-[var(--text-body)]"
          title={selectedText}
        >
          {preview}
        </p>
      </div>

      {/* Categories */}
      <div className="mt-1 px-1.5 pb-1.5 pt-1.5">
        {NOTE_CATEGORIES.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            onSelect={onAddToNotes}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteSelectionMenu;
