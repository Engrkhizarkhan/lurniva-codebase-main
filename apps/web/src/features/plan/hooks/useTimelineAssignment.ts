import { useEffect, useRef } from "react";
import type {
  AssignDaysDraft,
  CatalogSubject,
  ChapterAssignment,
  ContentSelectionDraft,
  SchedulePeriodDraft,
  TopicAssignment,
} from "../create-plan-types";
import {
  buildDayGrid,
  getSelectedChapters,
  getSelectedTopics,
  getUnscheduledChapters,
  getUnscheduledTopics,
} from "../lib/timeline-math";
import type { DayGridEntry, UnscheduledChapter, UnscheduledTopic } from "../lib/timeline-math";
import type { LibraryItemDto } from "../../library/services/library-items";
import { createId, getDurationDays } from "../types";

const DEFAULT_ASSIGNMENT_DURATION_DAYS = 2;
const DEFAULT_CHAPTER_DURATION_DAYS = 1;

function chapterKey(libraryItemId: string, chapterId: string): string {
  return `${libraryItemId}:${chapterId}`;
}

/** The non-rest days available to spread items across, in order. */
function collectAvailableDays(dayCount: number, restDayIndexes: number[]): number[] {
  const restSet = new Set(restDayIndexes);
  const days: number[] = [];
  for (let day = 1; day <= dayCount; day++) {
    if (!restSet.has(day)) days.push(day);
  }
  return days;
}

/** Spreads chapters one-per-day round-robin across the available days (wraps if there are more chapters than days). */
function distributeChapters(
  chapters: UnscheduledChapter[],
  dayCount: number,
  restDayIndexes: number[],
): ChapterAssignment[] {
  if (chapters.length === 0) return [];
  const availableDays = collectAvailableDays(dayCount, restDayIndexes);
  if (availableDays.length === 0) return [];
  return chapters.map((chapter, index) => ({
    assignmentId: createId(),
    kind: "chapter" as const,
    libraryItemId: chapter.libraryItemId,
    chapterId: chapter.chapterId,
    startDayIndex: availableDays[index % availableDays.length]!,
    durationDays: DEFAULT_CHAPTER_DURATION_DAYS,
  }));
}

interface UseTimelineAssignmentArgs {
  subjects: CatalogSubject[];
  libraryItems: LibraryItemDto[];
  content: ContentSelectionDraft;
  schedule: Partial<SchedulePeriodDraft>;
  assignment: AssignDaysDraft;
  onChange: (assignment: AssignDaysDraft) => void;
}

export interface UseTimelineAssignmentResult {
  days: DayGridEntry[];
  dayCount: number;
  unscheduledTopics: UnscheduledTopic[];
  unscheduledChapters: UnscheduledChapter[];
  totalSelectedTopics: number;
  restDayCount: number;
  assignTopicToDay: (topic: UnscheduledTopic, dayIndex: number) => void;
  assignChapterToDay: (chapter: UnscheduledChapter, dayIndex: number) => void;
  moveAssignment: (assignmentId: string, newStartDayIndex: number) => void;
  updateAssignmentDuration: (assignmentId: string, durationDays: number) => void;
  removeAssignment: (assignmentId: string) => void;
  toggleRestDay: (dayIndex: number) => void;
  addNextRestDay: () => void;
  autoDistribute: () => void;
}

export function useTimelineAssignment({
  subjects,
  libraryItems,
  content,
  schedule,
  assignment,
  onChange,
}: UseTimelineAssignmentArgs): UseTimelineAssignmentResult {
  const scheduleStartISO = schedule.startDate ?? new Date().toISOString().slice(0, 10);
  const dayCount =
    schedule.startDate && schedule.endDate
      ? getDurationDays(schedule.startDate, schedule.endDate)
      : 0;

  const selectedTopics = getSelectedTopics(subjects, content);
  const selectedChapters = getSelectedChapters(libraryItems, content);
  const days = buildDayGrid(
    dayCount,
    scheduleStartISO,
    assignment.assignments,
    assignment.restDayIndexes,
  );
  const unscheduledTopics = getUnscheduledTopics(selectedTopics, assignment.assignments);
  const unscheduledChapters = getUnscheduledChapters(selectedChapters, assignment.assignments);

  function clampDuration(startDayIndex: number, durationDays: number): number {
    const maxDuration = Math.max(1, dayCount - startDayIndex + 1);
    return Math.min(Math.max(1, durationDays), maxDuration);
  }

  function assignTopicToDay(topic: UnscheduledTopic, dayIndex: number) {
    const newAssignment: TopicAssignment = {
      assignmentId: createId(),
      kind: "topic",
      topicId: topic.topicId,
      subjectId: topic.subjectId,
      subtopicIds: topic.remainingSubtopicIds,
      startDayIndex: dayIndex,
      durationDays: clampDuration(dayIndex, DEFAULT_ASSIGNMENT_DURATION_DAYS),
    };
    onChange({
      ...assignment,
      assignments: [...assignment.assignments, newAssignment],
    });
  }

  function assignChapterToDay(chapter: UnscheduledChapter, dayIndex: number) {
    const newAssignment: ChapterAssignment = {
      assignmentId: createId(),
      kind: "chapter",
      libraryItemId: chapter.libraryItemId,
      chapterId: chapter.chapterId,
      startDayIndex: dayIndex,
      durationDays: clampDuration(dayIndex, DEFAULT_CHAPTER_DURATION_DAYS),
    };
    onChange({
      ...assignment,
      assignments: [...assignment.assignments, newAssignment],
    });
  }

  function moveAssignment(assignmentId: string, newStartDayIndex: number) {
    onChange({
      ...assignment,
      assignments: assignment.assignments.map((item) =>
        item.assignmentId === assignmentId
          ? {
              ...item,
              startDayIndex: newStartDayIndex,
              durationDays: clampDuration(newStartDayIndex, item.durationDays),
            }
          : item,
      ),
    });
  }

  function updateAssignmentDuration(assignmentId: string, durationDays: number) {
    onChange({
      ...assignment,
      assignments: assignment.assignments.map((item) =>
        item.assignmentId === assignmentId
          ? { ...item, durationDays: clampDuration(item.startDayIndex, durationDays) }
          : item,
      ),
    });
  }

  function removeAssignment(assignmentId: string) {
    onChange({
      ...assignment,
      assignments: assignment.assignments.filter(
        (item) => item.assignmentId !== assignmentId,
      ),
    });
  }

  function toggleRestDay(dayIndex: number) {
    const isRest = assignment.restDayIndexes.includes(dayIndex);
    onChange({
      ...assignment,
      restDayIndexes: isRest
        ? assignment.restDayIndexes.filter((day) => day !== dayIndex)
        : [...assignment.restDayIndexes, dayIndex],
    });
  }

  function addNextRestDay() {
    for (let day = 1; day <= dayCount; day++) {
      if (assignment.restDayIndexes.includes(day)) continue;
      const hasAssignment = assignment.assignments.some(
        (item) => day >= item.startDayIndex && day < item.startDayIndex + item.durationDays,
      );
      if (hasAssignment) continue;
      toggleRestDay(day);
      return;
    }
  }

  function autoDistribute() {
    const restSet = new Set(assignment.restDayIndexes);
    let cursor = 1;
    const newTopicAssignments: TopicAssignment[] = [];
    for (const topic of unscheduledTopics) {
      while (cursor <= dayCount && restSet.has(cursor)) cursor += 1;
      if (cursor > dayCount) break;
      const durationDays = clampDuration(cursor, DEFAULT_ASSIGNMENT_DURATION_DAYS);
      newTopicAssignments.push({
        assignmentId: createId(),
        kind: "topic",
        topicId: topic.topicId,
        subjectId: topic.subjectId,
        subtopicIds: topic.remainingSubtopicIds,
        startDayIndex: cursor,
        durationDays,
      });
      cursor += durationDays;
    }

    const newChapterAssignments = distributeChapters(
      unscheduledChapters,
      dayCount,
      assignment.restDayIndexes,
    );

    const newAssignments = [...newTopicAssignments, ...newChapterAssignments];
    if (newAssignments.length === 0) return;
    onChange({
      ...assignment,
      assignments: [...assignment.assignments, ...newAssignments],
    });
  }

  // Chapters are auto-placed one-per-day by default (the user can still drag
  // them elsewhere afterwards). `handledChapterKeys` remembers every chapter
  // that has ever been auto-placed or manually removed, so a chapter the user
  // deliberately took off the grid never gets silently re-added — only a
  // chapter that has *never* been touched gets auto-scheduled.
  const handledChapterKeysRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (dayCount === 0) return;
    const toPlace = unscheduledChapters.filter(
      (chapter) => !handledChapterKeysRef.current.has(chapterKey(chapter.libraryItemId, chapter.chapterId)),
    );
    if (toPlace.length === 0) return;
    for (const chapter of toPlace) {
      handledChapterKeysRef.current.add(chapterKey(chapter.libraryItemId, chapter.chapterId));
    }
    const newAssignments = distributeChapters(toPlace, dayCount, assignment.restDayIndexes);
    if (newAssignments.length === 0) return;
    onChange({
      ...assignment,
      assignments: [...assignment.assignments, ...newAssignments],
    });
    // Re-runs only when the set of unscheduled chapters or the day count
    // changes; `handledChapterKeysRef` makes re-runs a no-op once everything
    // currently unscheduled has already been handled once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unscheduledChapters, dayCount]);

  // A chapter the user manually removes should count as "handled" too, so it
  // doesn't get silently re-added by the effect above on the next render.
  function removeAssignmentWithChapterTracking(assignmentId: string) {
    const removed = assignment.assignments.find((item) => item.assignmentId === assignmentId);
    if (removed?.kind === "chapter") {
      handledChapterKeysRef.current.add(chapterKey(removed.libraryItemId, removed.chapterId));
    }
    removeAssignment(assignmentId);
  }

  return {
    days,
    dayCount,
    unscheduledTopics,
    unscheduledChapters,
    totalSelectedTopics: selectedTopics.length,
    restDayCount: assignment.restDayIndexes.length,
    assignTopicToDay,
    assignChapterToDay,
    moveAssignment,
    updateAssignmentDuration,
    removeAssignment: removeAssignmentWithChapterTracking,
    toggleRestDay,
    addNextRestDay,
    autoDistribute,
  };
}
