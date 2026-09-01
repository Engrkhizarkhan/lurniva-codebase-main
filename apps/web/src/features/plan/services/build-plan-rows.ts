import { addDaysISO } from "../lib/calendar";
import { getDurationDays } from "../types";
import type { CreatePlanDraft } from "../create-plan-types";

export interface PlanDayRow {
  dayNumber: number;
  scheduledDate: string;
  isRestDay: boolean;
}

export interface PlanTaskRow {
  dayNumber: number;
  topicId?: bigint;
  subtopicId?: bigint | null;
  libraryItemId?: bigint;
  chapterId?: string;
  title?: string;
  orderIndex: number;
}

export interface BuiltPlanRows {
  name: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  days: PlanDayRow[];
  tasks: PlanTaskRow[];
}

/**
 * Server-side counterpart to the old client-only `buildPlanFromDraft`: expands
 * a wizard draft into the day/task rows `study_plans`/`plan_days`/`plan_tasks`
 * need. Assumes `draft` already passed `createPlanDraftSchema` (start/end
 * date and name are present, not optional).
 *
 * `chapterTitleByKey` (keyed `"${libraryItemId}:${chapterId}"`) resolves a
 * chapter assignment's display title at persist time, so day reads never need
 * a join back to `LibraryItem` just to label a task.
 */
export function buildPlanRows(
  draft: CreatePlanDraft,
  chapterTitleByKey?: Map<string, string>,
): BuiltPlanRows {
  const startDate = draft.schedule.startDate;
  if (!startDate) {
    throw new Error("Draft is missing a schedule start date");
  }
  const { assignments, restDayIndexes } = draft.assignment;

  // A topic assignment or rest day can push past the nominally selected end
  // date (e.g. the last topic's duration overruns it) — clamp the plan's
  // actual end date to whichever is later, matching the old client logic.
  const maxAssignmentDay = assignments.reduce(
    (max, assignment) =>
      Math.max(max, assignment.startDayIndex + assignment.durationDays - 1),
    0,
  );
  const maxRestDay = restDayIndexes.reduce((max, day) => Math.max(max, day), 0);
  const maxDay = Math.max(maxAssignmentDay, maxRestDay);

  const scheduleEndDate = draft.schedule.endDate ?? startDate;
  const computedEndDate =
    maxDay > 0 ? addDaysISO(startDate, maxDay - 1) : scheduleEndDate;
  const endDate =
    computedEndDate > scheduleEndDate ? computedEndDate : scheduleEndDate;

  const durationDays = getDurationDays(startDate, endDate);
  const restDaySet = new Set(restDayIndexes);

  const days: PlanDayRow[] = Array.from(
    { length: durationDays },
    (_, index) => {
      const dayNumber = index + 1;
      return {
        dayNumber,
        scheduledDate: addDaysISO(startDate, index),
        isRestDay: restDaySet.has(dayNumber),
      };
    },
  );

  const orderIndexByDay = new Map<number, number>();
  const tasks: PlanTaskRow[] = [];
  for (const assignment of assignments) {
    const dayEnd = Math.min(
      assignment.startDayIndex + assignment.durationDays - 1,
      durationDays,
    );
    for (
      let dayNumber = assignment.startDayIndex;
      dayNumber <= dayEnd;
      dayNumber++
    ) {
      if (assignment.kind === "chapter") {
        const orderIndex = orderIndexByDay.get(dayNumber) ?? 0;
        orderIndexByDay.set(dayNumber, orderIndex + 1);
        const key = `${assignment.libraryItemId}:${assignment.chapterId}`;
        tasks.push({
          dayNumber,
          libraryItemId: BigInt(assignment.libraryItemId),
          chapterId: assignment.chapterId,
          title: chapterTitleByKey?.get(key),
          orderIndex,
        });
        continue;
      }

      const subtopicIds =
        assignment.subtopicIds.length > 0 ? assignment.subtopicIds : [null];
      for (const subtopicId of subtopicIds) {
        const orderIndex = orderIndexByDay.get(dayNumber) ?? 0;
        orderIndexByDay.set(dayNumber, orderIndex + 1);
        tasks.push({
          dayNumber,
          topicId: BigInt(assignment.topicId),
          subtopicId: subtopicId ? BigInt(subtopicId) : null,
          orderIndex,
        });
      }
    }
  }

  return {
    name: draft.basicInfo.name?.trim() || "Untitled study plan",
    startDate,
    endDate,
    durationDays,
    days,
    tasks,
  };
}
