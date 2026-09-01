import { useDroppable } from "@dnd-kit/core";
import { Moon, Plus } from "lucide-react";
import { cn } from "@lurniva/ui";
import type {
  CatalogLookupEntry,
  DayGridEntry,
  LibraryLookupEntry,
} from "../../../lib/timeline-math";
import {
  formatDayDate,
  getAssignmentDisplayInfo,
} from "../../../lib/timeline-math";
import { dayDroppableId } from "../../../hooks/useAssignmentDragAndDrop";
import { AssignmentChip } from "./assignment-chip";

interface DayRowProps {
  day: DayGridEntry;
  dayCount: number;
  catalogLookup: Map<string, CatalogLookupEntry>;
  libraryLookup: Map<string, LibraryLookupEntry>;
  /** The day the user is currently working on — clicked, or being dropped onto. */
  isFocused: boolean;
  onFocus: () => void;
  onToggleRest: () => void;
  onDurationChange: (assignmentId: string, days: number) => void;
  onRemove: (assignmentId: string) => void;
}

/**
 * One day in the schedule. Every state a day can be in is stated by the row
 * itself — rest, empty and available, holding work, continuing work from an
 * earlier day, the active drop target, or the day being edited — so the
 * calendar can be read without a key.
 */
export function DayRow({
  day,
  dayCount,
  catalogLookup,
  libraryLookup,
  isFocused,
  onFocus,
  onToggleRest,
  onDurationChange,
  onRemove,
}: DayRowProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: dayDroppableId(day.dayIndex),
  });

  const startingAssignments = day.assignments.filter(
    (assignment) => assignment.startDayIndex === day.dayIndex,
  );
  const continuingAssignments = day.assignments.filter(
    (assignment) => assignment.startDayIndex !== day.dayIndex,
  );
  const isEmpty = day.assignments.length === 0;

  return (
    <div
      onClick={onFocus}
      className={cn(
        "rounded-xl border transition-colors duration-150",
        // A filled day gets a solid card and an accent spine; an available day
        // stays quiet and dashed so the eye goes to what still needs work.
        day.isRest
          ? "border-dashed border-border-default bg-surface-sunken"
          : isEmpty
            ? "border-dashed border-border-default bg-transparent"
            : "border-border-subtle bg-surface-card",
        isOver && "border-primary bg-primary-soft ring-2 ring-primary",
        !isOver && isFocused && "ring-2 ring-secondary/60",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 pt-2.5">
        <div className="flex min-w-0 items-baseline gap-2">
          <span
            className={cn(
              "shrink-0 text-sm font-bold",
              day.isRest ? "text-text-muted" : "text-text-heading",
            )}
          >
            Day {day.dayIndex}
          </span>
          <span className="truncate text-xs text-text-faint">
            {formatDayDate(day.date)}
          </span>
          {!day.isRest && day.assignments.length > 0 ? (
            <span className="shrink-0 rounded-md bg-primary-soft px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {day.assignments.length}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleRest();
          }}
          aria-pressed={day.isRest}
          aria-label={day.isRest ? "Unmark rest day" : "Mark as rest day"}
          title={day.isRest ? "Unmark rest day" : "Mark as rest day"}
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors duration-150",
            day.isRest
              ? "bg-primary text-text-on-primary"
              : "text-text-faint hover:bg-surface-sunken hover:text-text-body",
          )}
        >
          <Moon size={14} />
          Rest day
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="grid gap-1.5 px-3 pb-2.5 pt-2"
      >
        {continuingAssignments.map((assignment) => {
          const { title } = getAssignmentDisplayInfo(
            assignment,
            catalogLookup,
            libraryLookup,
          );
          const endDayIndex =
            assignment.startDayIndex + assignment.durationDays - 1;
          return (
            // Work carried over from an earlier day is a continuation of that
            // day's chip, not a second copy of it — so it renders as a spine.
            <div
              key={assignment.assignmentId}
              className="flex items-center gap-2 rounded-md border-l-2 border-secondary/50 bg-secondary-soft/40 px-2 py-1"
            >
              <span className="truncate text-[11px] font-semibold text-text-muted">
                {title}
              </span>
              <span className="ml-auto shrink-0 text-[10px] font-medium text-text-faint">
                continues to day {endDayIndex}
              </span>
            </div>
          );
        })}

        {startingAssignments.map((assignment) => (
          <AssignmentChip
            key={assignment.assignmentId}
            assignment={assignment}
            catalogLookup={catalogLookup}
            libraryLookup={libraryLookup}
            maxDuration={dayCount - assignment.startDayIndex + 1}
            onDurationChange={(days) =>
              onDurationChange(assignment.assignmentId, days)
            }
            onRemove={() => onRemove(assignment.assignmentId)}
          />
        ))}

        {isEmpty ? (
          <p
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-xs font-medium",
              day.isRest ? "text-text-muted" : "text-text-faint",
            )}
          >
            {day.isRest ? (
              <>
                <Moon size={12} />
                Rest day — nothing scheduled
              </>
            ) : (
              <>
                <Plus size={12} />
                Drop a topic here
              </>
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}
