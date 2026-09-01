import { useMemo, useState } from "react";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { Moon, NotebookText, Sparkles } from "lucide-react";
import { Button } from "@lurniva/ui";
import type { CatalogSubject } from "../../../create-plan-types";
import type { UseTimelineAssignmentResult } from "../../../hooks/useTimelineAssignment";
import { useAssignmentDragAndDrop } from "../../../hooks/useAssignmentDragAndDrop";
import type { DayGridEntry } from "../../../lib/timeline-math";
import {
  buildCatalogLookup,
  buildLibraryLookup,
  weekOfDay,
} from "../../../lib/timeline-math";
import type { LibraryItemDto } from "../../../../library/services/library-items";
import { DayRow } from "./day-row";
import { DragOverlayPreview } from "./drag-overlay-preview";
import { TopicsToSchedulePanel } from "./topics-to-schedule-panel";

interface TimelinePanelProps {
  subjects: CatalogSubject[];
  libraryItems: LibraryItemDto[];
  timeline: UseTimelineAssignmentResult;
  librarySelectedCount: number;
}

export function TimelinePanel({
  subjects,
  libraryItems,
  timeline,
  librarySelectedCount,
}: TimelinePanelProps) {
  const catalogLookup = useMemo(() => buildCatalogLookup(subjects), [subjects]);
  const libraryLookup = useMemo(() => buildLibraryLookup(libraryItems), [libraryItems]);

  // Which day the user is working on. Purely a viewing aid — it never changes
  // the schedule, so it stays local rather than joining the plan draft.
  const [focusedDayIndex, setFocusedDayIndex] = useState<number | null>(null);

  // Weeks give the day list a rhythm to scan by without changing the fixed,
  // day-indexed structure underneath it.
  const weeks = useMemo(() => {
    const grouped: { week: number; days: DayGridEntry[] }[] = [];
    for (const day of timeline.days) {
      const week = weekOfDay(day.dayIndex);
      const current = grouped[grouped.length - 1];
      if (current && current.week === week) current.days.push(day);
      else grouped.push({ week, days: [day] });
    }
    return grouped;
  }, [timeline.days]);

  const dnd = useAssignmentDragAndDrop({
    onAssignTopicToDay: timeline.assignTopicToDay,
    onAssignChapterToDay: timeline.assignChapterToDay,
    onMoveAssignment: timeline.moveAssignment,
  });

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-raised p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-text-heading">Plan Overview</h2>
          <p className="mt-0.5 text-sm text-text-muted">
            The days stay fixed — drag topics onto any day. A day can hold more than
            one.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Sparkles size={14} />}
            onClick={timeline.autoDistribute}
            disabled={
              timeline.unscheduledTopics.length === 0 &&
              timeline.unscheduledChapters.length === 0
            }
          >
            Auto Distribute
          </Button>
        </div>
      </div>

      {timeline.dayCount > 0 &&
      librarySelectedCount > 0 &&
      timeline.unscheduledChapters.length === 0 &&
      !timeline.days.some((day) =>
        day.assignments.some((item) => item.kind === "chapter"),
      ) ? (
        <p className="mt-3 rounded-xl border border-color-forest-300 bg-color-forest-050 px-4 py-3 text-sm font-medium text-color-forest-800">
          {librarySelectedCount} selected library resource
          {librarySelectedCount === 1 ? " is" : "s are"} still processing —
          chapters will be scheduled onto days automatically once ready.
        </p>
      ) : null}

      {timeline.days.length > 0 ? (
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-text-muted">
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-border-subtle bg-surface-card" />
            Has topics
          </li>
          <li className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm border border-dashed border-border-default" />
            Available
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-1 rounded-sm bg-secondary/50" />
            Continues from an earlier day
          </li>
          <li className="flex items-center gap-1.5">
            <Moon size={11} className="text-text-faint" />
            Rest day
          </li>
          <li className="flex items-center gap-1.5">
            <NotebookText size={11} className="text-primary" />
            Topic
          </li>
        </ul>
      ) : null}

      <DndContext
        sensors={dnd.sensors}
        onDragStart={dnd.handleDragStart}
        onDragEnd={dnd.handleDragEnd}
        onDragCancel={dnd.handleDragCancel}
      >
        <div className="mt-4 grid items-start gap-4 md:grid-cols-[1fr_300px]">
          <div className="grid gap-4">
            {weeks.map(({ week, days }) => (
              <section key={week} className="grid gap-2">
                {weeks.length > 1 ? (
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-faint">
                    Week {week}
                  </h3>
                ) : null}
                {days.map((day) => (
                  <DayRow
                    key={day.dayIndex}
                    day={day}
                    dayCount={timeline.dayCount}
                    catalogLookup={catalogLookup}
                    libraryLookup={libraryLookup}
                    isFocused={focusedDayIndex === day.dayIndex}
                    onFocus={() => setFocusedDayIndex(day.dayIndex)}
                    onToggleRest={() => timeline.toggleRestDay(day.dayIndex)}
                    onDurationChange={timeline.updateAssignmentDuration}
                    onRemove={timeline.removeAssignment}
                  />
                ))}
              </section>
            ))}
            {timeline.days.length === 0 ? (
              <p className="py-8 text-center text-sm text-text-faint">
                Choose a study period in the previous step to build your day-by-day
                plan.
              </p>
            ) : null}
          </div>

          <TopicsToSchedulePanel
            topics={timeline.unscheduledTopics}
            chapters={timeline.unscheduledChapters}
            libraryOnly={librarySelectedCount > 0}
          />
        </div>

        <DragOverlay>
          {dnd.activeItem ? (
            <DragOverlayPreview
              item={dnd.activeItem}
              catalogLookup={catalogLookup}
              libraryLookup={libraryLookup}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
