import type {
  CatalogSubject,
  ChapterAssignment,
  ContentSelectionDraft,
  ScheduleAssignment,
  TopicAssignment,
} from "../create-plan-types";
import type { LibraryItemDto } from "../../library/services/library-items";
import { addDaysISO, formatWeekdayShort, fromISODate } from "./calendar";

// ---------------------------------------------------------------------------
// Day grid — the fixed sequence of days derived purely from the Step 3 date
// range. Days never move or reorder; only which assignments overlap a given
// day (and whether it's flagged as rest) can change.
// ---------------------------------------------------------------------------

export interface DayGridEntry {
  dayIndex: number;
  date: string;
  isRest: boolean;
  assignments: ScheduleAssignment[];
}

export function buildDayGrid(
  dayCount: number,
  scheduleStartISO: string,
  assignments: ScheduleAssignment[],
  restDayIndexes: number[],
): DayGridEntry[] {
  const restSet = new Set(restDayIndexes);
  return Array.from({ length: dayCount }, (_, index) => {
    const dayIndex = index + 1;
    return {
      dayIndex,
      date: addDaysISO(scheduleStartISO, index),
      isRest: restSet.has(dayIndex),
      assignments: assignments.filter(
        (assignment) =>
          dayIndex >= assignment.startDayIndex &&
          dayIndex < assignment.startDayIndex + assignment.durationDays,
      ),
    };
  });
}

export function formatDayLabel(dayIndex: number, dateISO: string): string {
  return `Day ${dayIndex} · ${formatWeekdayShort(dateISO)}`;
}

/** "Wed 12 Mar" — the calendar date behind a day index, for the day header. */
export function formatDayDate(dateISO: string): string {
  return fromISODate(dateISO).toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

/** 1-based week number a day falls into, for grouping the day list. */
export function weekOfDay(dayIndex: number): number {
  return Math.floor((dayIndex - 1) / 7) + 1;
}

/** e.g. "Day 3–4" for a multi-day assignment, "Day 3" for a single day. */
export function formatAssignmentSpanLabel(assignment: ScheduleAssignment): string {
  const endDayIndex = assignment.startDayIndex + assignment.durationDays - 1;
  return assignment.startDayIndex === endDayIndex
    ? `Day ${assignment.startDayIndex}`
    : `Day ${assignment.startDayIndex}–${endDayIndex}`;
}

export interface CatalogLookupEntry {
  subjectLabel: string;
  topicLabel: string;
  subtopicLabelById: Map<string, string>;
}

/** Resolves topicId -> subject/topic/subtopic labels, shared by the timeline and review steps. */
export function buildCatalogLookup(
  subjects: CatalogSubject[],
): Map<string, CatalogLookupEntry> {
  const map = new Map<string, CatalogLookupEntry>();
  for (const subject of subjects) {
    for (const topic of subject.topics) {
      map.set(topic.id, {
        subjectLabel: subject.label,
        topicLabel: topic.label,
        subtopicLabelById: new Map(
          topic.subtopics.map((subtopic) => [subtopic.id, subtopic.label]),
        ),
      });
    }
  }
  return map;
}

export interface AssignmentDisplayInfo {
  title: string;
  breadcrumbSubject: string;
  breadcrumbTopic: string;
}

/**
 * The subtopics an assignment actually covers, in catalog order. The chip
 * shows these under the topic so the topic -> subtopic -> day relationship is
 * visible in the calendar itself rather than needing an extra row.
 */
export function getAssignmentSubtopicLabels(
  assignment: ScheduleAssignment,
  catalogLookup: Map<string, CatalogLookupEntry>,
): string[] {
  if (assignment.kind !== "topic") return [];
  const entry = catalogLookup.get(assignment.topicId);
  if (!entry) return [];
  return assignment.subtopicIds.map(
    (subtopicId) => entry.subtopicLabelById.get(subtopicId) ?? subtopicId,
  );
}

export interface LibraryLookupEntry {
  libraryItemTitle: string;
  chapterTitleById: Map<string, string>;
}

/** Resolves libraryItemId -> book title / chapter titles, shared by the timeline and review steps. */
export function buildLibraryLookup(
  libraryItems: LibraryItemDto[],
): Map<string, LibraryLookupEntry> {
  const map = new Map<string, LibraryLookupEntry>();
  for (const item of libraryItems) {
    map.set(item.id, {
      libraryItemTitle: item.title,
      chapterTitleById: new Map(item.chapters.map((chapter) => [chapter.id, chapter.title])),
    });
  }
  return map;
}

/**
 * Bold title: for a topic assignment, the topic name (or the specific
 * subtopic name when it narrows down to just one) — e.g. "Gravitation" vs
 * "Newton's Laws of Motion" (Mechanics). For a chapter assignment, the
 * chapter title, breadcrumbed under its source book.
 */
export function getAssignmentDisplayInfo(
  assignment: ScheduleAssignment,
  catalogLookup: Map<string, CatalogLookupEntry>,
  libraryLookup: Map<string, LibraryLookupEntry>,
): AssignmentDisplayInfo {
  if (assignment.kind === "chapter") {
    const entry = libraryLookup.get(assignment.libraryItemId);
    const title = entry?.chapterTitleById.get(assignment.chapterId) ?? "Chapter";
    return {
      title,
      breadcrumbSubject: entry?.libraryItemTitle ?? "Library",
      breadcrumbTopic: "",
    };
  }

  const entry = catalogLookup.get(assignment.topicId);
  const subjectLabel = entry?.subjectLabel ?? "";
  const topicLabel = entry?.topicLabel ?? "";
  const firstSubtopicId = assignment.subtopicIds[0];
  const title =
    assignment.subtopicIds.length === 1 && firstSubtopicId
      ? (entry?.subtopicLabelById.get(firstSubtopicId) ?? topicLabel)
      : topicLabel;
  return { title, breadcrumbSubject: subjectLabel, breadcrumbTopic: topicLabel };
}

// ---------------------------------------------------------------------------
// Selected content <-> scheduling state
// ---------------------------------------------------------------------------

export interface SelectedTopicSummary {
  topicId: string;
  topicLabel: string;
  subjectId: string;
  subjectLabel: string;
  selectedSubtopicIds: string[];
  selectedSubtopicLabels: string[];
}

export function getSelectedTopics(
  catalog: CatalogSubject[],
  content: ContentSelectionDraft,
): SelectedTopicSummary[] {
  const summaries: SelectedTopicSummary[] = [];
  for (const subject of catalog) {
    for (const topic of subject.topics) {
      const selectedSubtopicIds =
        content.selectedSubtopicIdsByTopicId[topic.id] ?? [];
      if (selectedSubtopicIds.length === 0) continue;
      summaries.push({
        topicId: topic.id,
        topicLabel: topic.label,
        subjectId: subject.id,
        subjectLabel: subject.label,
        selectedSubtopicIds,
        selectedSubtopicLabels: topic.subtopics
          .filter((subtopic) => selectedSubtopicIds.includes(subtopic.id))
          .map((subtopic) => subtopic.label),
      });
    }
  }
  return summaries;
}

export interface UnscheduledTopic extends SelectedTopicSummary {
  /** Subtopics not yet covered by any assignment for this topic. */
  remainingSubtopicIds: string[];
  remainingSubtopicLabels: string[];
  remainingCount: number;
  totalCount: number;
  isPartiallyScheduled: boolean;
}

export function getUnscheduledTopics(
  selectedTopics: SelectedTopicSummary[],
  assignments: ScheduleAssignment[],
  /** Exclude this assignment's own reservation — used when moving/editing it, so its current subtopics are pickable again. */
  excludeAssignmentId?: string,
): UnscheduledTopic[] {
  const relevantAssignments = assignments.filter(
    (assignment): assignment is TopicAssignment =>
      assignment.kind === "topic" && assignment.assignmentId !== excludeAssignmentId,
  );
  const scheduledSubtopicIdsByTopicId = new Map<string, Set<string>>();
  for (const assignment of relevantAssignments) {
    const existing =
      scheduledSubtopicIdsByTopicId.get(assignment.topicId) ?? new Set<string>();
    for (const subtopicId of assignment.subtopicIds) existing.add(subtopicId);
    scheduledSubtopicIdsByTopicId.set(assignment.topicId, existing);
  }

  const unscheduled: UnscheduledTopic[] = [];
  for (const topic of selectedTopics) {
    const scheduled = scheduledSubtopicIdsByTopicId.get(topic.topicId) ?? new Set<string>();
    const remainingIndexes = topic.selectedSubtopicIds
      .map((id, index) => ({ id, index }))
      .filter(({ id }) => !scheduled.has(id));
    if (remainingIndexes.length === 0) continue;
    unscheduled.push({
      ...topic,
      remainingSubtopicIds: remainingIndexes.map(({ id }) => id),
      remainingSubtopicLabels: remainingIndexes.map(
        ({ id, index }) => topic.selectedSubtopicLabels[index] ?? id,
      ),
      remainingCount: remainingIndexes.length,
      totalCount: topic.selectedSubtopicIds.length,
      isPartiallyScheduled: scheduled.size > 0,
    });
  }
  return unscheduled;
}

// ---------------------------------------------------------------------------
// Library chapters <-> scheduling state (mirrors the topic helpers above, but
// a chapter is atomic — no subtopic-style partial scheduling).
// ---------------------------------------------------------------------------

export interface SelectedChapterSummary {
  libraryItemId: string;
  libraryItemTitle: string;
  chapterId: string;
  chapterTitle: string;
}

export type UnscheduledChapter = SelectedChapterSummary;

/** Chapters of every selected, fully-processed library item — flattened and ready to schedule. */
export function getSelectedChapters(
  libraryItems: LibraryItemDto[],
  content: ContentSelectionDraft,
): SelectedChapterSummary[] {
  const selectedIds = new Set(content.libraryItemIds ?? []);
  const summaries: SelectedChapterSummary[] = [];
  for (const item of libraryItems) {
    if (item.status !== "ready" || !selectedIds.has(item.id)) continue;
    for (const chapter of item.chapters) {
      summaries.push({
        libraryItemId: item.id,
        libraryItemTitle: item.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
      });
    }
  }
  return summaries;
}

export function getUnscheduledChapters(
  selectedChapters: SelectedChapterSummary[],
  assignments: ScheduleAssignment[],
  /** Exclude this assignment's own reservation — used when moving/editing it. */
  excludeAssignmentId?: string,
): UnscheduledChapter[] {
  const scheduledKeys = new Set(
    assignments
      .filter(
        (assignment): assignment is ChapterAssignment =>
          assignment.kind === "chapter" && assignment.assignmentId !== excludeAssignmentId,
      )
      .map((assignment) => `${assignment.libraryItemId}:${assignment.chapterId}`),
  );
  return selectedChapters.filter(
    (chapter) => !scheduledKeys.has(`${chapter.libraryItemId}:${chapter.chapterId}`),
  );
}
