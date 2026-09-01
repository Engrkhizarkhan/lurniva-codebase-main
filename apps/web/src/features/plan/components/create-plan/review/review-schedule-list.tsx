import { useMemo } from "react";
import { ChevronRight, Moon } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { CatalogSubject } from "../../../create-plan-types";
import type { DayGridEntry } from "../../../lib/timeline-math";
import {
  buildCatalogLookup,
  buildLibraryLookup,
  formatDayLabel,
  getAssignmentDisplayInfo,
} from "../../../lib/timeline-math";
import type { LibraryItemDto } from "../../../../library/services/library-items";

interface ReviewScheduleListProps {
  subjects: CatalogSubject[];
  libraryItems: LibraryItemDto[];
  days: DayGridEntry[];
  librarySelected?: boolean;
}

export function ReviewScheduleList({
  subjects,
  libraryItems,
  days,
  librarySelected = false,
}: ReviewScheduleListProps) {
  const catalogLookup = useMemo(() => buildCatalogLookup(subjects), [subjects]);
  const libraryLookup = useMemo(() => buildLibraryLookup(libraryItems), [libraryItems]);

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm">
      <h2 className="text-sm font-bold text-text-heading">Day-by-day schedule</h2>
      <div className="mt-3 grid gap-1.5">
        {days.map((day) => {
          const startingAssignments = day.assignments.filter(
            (assignment) => assignment.startDayIndex === day.dayIndex,
          );
          const isEmpty = day.assignments.length === 0;

          return (
            <div
              key={day.dayIndex}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3.5 py-2.5",
                day.isRest
                  ? "border-dashed border-border-strong bg-surface-sunken"
                  : "border-border-subtle bg-surface-card",
              )}
            >
              <p className="w-24 shrink-0 text-xs font-bold text-text-heading">
                {formatDayLabel(day.dayIndex, day.date)}
              </p>

              <div className="grid min-w-0 flex-1 gap-1">
                {startingAssignments.map((assignment) => {
                  const display = getAssignmentDisplayInfo(
                    assignment,
                    catalogLookup,
                    libraryLookup,
                  );
                  return (
                    <div key={assignment.assignmentId} className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-heading">
                        {display.title}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-text-muted">
                        <span className="truncate">{display.breadcrumbSubject}</span>
                        {display.breadcrumbTopic ? (
                          <>
                            <ChevronRight size={10} className="shrink-0" />
                            <span className="truncate">{display.breadcrumbTopic}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  );
                })}

                {isEmpty && day.isRest ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-muted">
                    <Moon size={14} />
                    Rest Day
                  </div>
                ) : null}

                {isEmpty && !day.isRest ? (
                  <p className="text-sm text-text-faint">
                    {librarySelected
                      ? "Library study — no specific topic"
                      : "Nothing scheduled"}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
