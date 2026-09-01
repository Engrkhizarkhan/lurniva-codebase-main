import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BookOpen, GripVertical, NotebookText, X } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { ScheduleAssignment } from "../../../create-plan-types";
import type { CatalogLookupEntry, LibraryLookupEntry } from "../../../lib/timeline-math";
import {
  formatAssignmentSpanLabel,
  getAssignmentDisplayInfo,
  getAssignmentSubtopicLabels,
} from "../../../lib/timeline-math";
import { DurationDropdown } from "./duration-dropdown";

interface AssignmentChipProps {
  assignment: ScheduleAssignment;
  catalogLookup: Map<string, CatalogLookupEntry>;
  libraryLookup: Map<string, LibraryLookupEntry>;
  maxDuration: number;
  onDurationChange: (days: number) => void;
  onRemove: () => void;
}

/**
 * One scheduled item on a day. It carries the whole relationship in place —
 * subject, topic, the subtopics it covers, and the days it spans — so the
 * calendar never needs a parallel list to explain itself.
 */
export function AssignmentChip({
  assignment,
  catalogLookup,
  libraryLookup,
  maxDuration,
  onDurationChange,
  onRemove,
}: AssignmentChipProps) {
  const display = getAssignmentDisplayInfo(assignment, catalogLookup, libraryLookup);
  const subtopics = getAssignmentSubtopicLabels(assignment, catalogLookup);
  const isMultiDay = assignment.durationDays > 1;
  const isChapter = assignment.kind === "chapter";
  // A single-subtopic assignment already reads as its own title.
  const showSubtopics = subtopics.length > 1;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `assignment:${assignment.assignmentId}`,
    data: { type: "assignment", assignment },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "rounded-lg border border-border-subtle bg-white px-2.5 py-2 shadow-xs",
        isDragging && "opacity-40",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          {...listeners}
          {...attributes}
          aria-label={`Drag ${display.title} to a different day`}
          className="flex size-6 shrink-0 cursor-grab items-center justify-center rounded text-text-faint hover:bg-surface-sunken active:cursor-grabbing"
        >
          <GripVertical size={13} />
        </button>

        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-md",
            isChapter ? "bg-info-soft text-info" : "bg-primary-soft text-primary",
          )}
        >
          {isChapter ? <BookOpen size={13} /> : <NotebookText size={13} />}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-text-heading">
            {display.title}
          </p>
          <p className="truncate text-[11px] text-text-faint">
            {display.breadcrumbSubject}
            {display.breadcrumbTopic && display.breadcrumbTopic !== display.title
              ? ` · ${display.breadcrumbTopic}`
              : ""}
          </p>
        </div>

        {isMultiDay ? (
          <span className="shrink-0 rounded-md bg-secondary-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-secondary">
            {formatAssignmentSpanLabel(assignment)}
          </span>
        ) : null}

        <DurationDropdown
          durationDays={assignment.durationDays}
          onChange={onDurationChange}
          maxDays={maxDuration}
          size="sm"
        />

        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${display.title}`}
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-faint hover:bg-error-soft hover:text-error"
        >
          <X size={13} />
        </button>
      </div>

      {showSubtopics ? (
        <ul className="mt-1.5 flex flex-wrap gap-1 pl-8">
          {subtopics.map((label) => (
            <li
              key={label}
              className="rounded bg-surface-sunken px-1.5 py-0.5 text-[11px] text-text-muted"
            >
              {label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
