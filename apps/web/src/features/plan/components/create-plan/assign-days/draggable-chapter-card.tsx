import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BookOpen, GripVertical } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { UnscheduledChapter } from "../../../lib/timeline-math";

interface DraggableChapterCardProps {
  chapter: UnscheduledChapter;
}

export function DraggableChapterCard({ chapter }: DraggableChapterCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `chapter:${chapter.libraryItemId}:${chapter.chapterId}`,
    data: { type: "unscheduled-chapter", chapter },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-card py-2 pr-2",
        isDragging && "opacity-40",
      )}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        aria-label={`Drag ${chapter.chapterTitle} onto a day`}
        className="flex size-8 shrink-0 cursor-grab items-center justify-center text-text-faint active:cursor-grabbing"
      >
        <GripVertical size={15} />
      </button>

      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
        <BookOpen size={14} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-text-muted">
          {chapter.libraryItemTitle}
        </p>
        <p className="truncate text-sm font-bold text-text-heading">
          {chapter.chapterTitle}
        </p>
      </div>
    </div>
  );
}
