import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type IconComponent = ComponentType<LucideProps>;

// ---------------------------------------------------------------------------
// Catalog — subjects available to study (Subject -> Topic -> Subtopic)
// ---------------------------------------------------------------------------

export interface CatalogSubtopic {
  id: string;
  label: string;
}

export interface CatalogTopic {
  id: string;
  label: string;
  subtopics: CatalogSubtopic[];
}

export interface CatalogSubject {
  id: string;
  label: string;
  icon: IconComponent;
  topics: CatalogTopic[];
}

/** Wire shape from `GET /api/catalog` — no `icon`, since a DB row can't carry a React component. */
export interface CatalogSubjectDto {
  id: string;
  label: string;
  topics: CatalogTopic[];
}

// ---------------------------------------------------------------------------
// Step 1 — Basic info
// ---------------------------------------------------------------------------

export interface BasicInfoDraft {
  name: string;
  dailyStudyHours: number | null;
}

// ---------------------------------------------------------------------------
// Step 2 — Study content selection
// ---------------------------------------------------------------------------

/** topicId -> selected subtopicIds. A topic counts as "selected" once it has at least one entry. */
export interface ContentSelectionDraft {
  selectedSubtopicIdsByTopicId: Record<string, string[]>;
  /**
   * Library items (Lurniva platform + the user's own) chosen as background
   * material for the plan. They ground chat/learning/assessment on the
   * matching days; unprocessed items are processed on selection.
   */
  libraryItemIds: string[];
}

// ---------------------------------------------------------------------------
// Step 3 — Schedule period
// ---------------------------------------------------------------------------

export interface SchedulePeriodDraft {
  /** ISO date string, e.g. "2025-05-20" */
  startDate: string | null;
  /** ISO date string, e.g. "2025-06-20" */
  endDate: string | null;
}

// ---------------------------------------------------------------------------
// Step 4 — Assign days (fixed day grid, topics dropped onto specific days)
// ---------------------------------------------------------------------------

export interface TopicAssignment {
  assignmentId: string;
  kind: "topic";
  topicId: string;
  subjectId: string;
  subtopicIds: string[];
  /** 1-based day index into the Step 3 schedule. */
  startDayIndex: number;
  durationDays: number;
}

/** A library item's chapter (a book/PDF chapter) scheduled onto a specific day. */
export interface ChapterAssignment {
  assignmentId: string;
  kind: "chapter";
  libraryItemId: string;
  chapterId: string;
  /** 1-based day index into the Step 3 schedule. */
  startDayIndex: number;
  durationDays: number;
}

export type ScheduleAssignment = TopicAssignment | ChapterAssignment;

export interface AssignDaysDraft {
  assignments: ScheduleAssignment[];
  /** Day indexes explicitly marked as rest — a flag on a day, not an inserted row. */
  restDayIndexes: number[];
}

// ---------------------------------------------------------------------------
// Cross-step draft
// ---------------------------------------------------------------------------

export interface CreatePlanDraft {
  basicInfo: Partial<BasicInfoDraft>;
  content: ContentSelectionDraft;
  schedule: Partial<SchedulePeriodDraft>;
  assignment: AssignDaysDraft;
}

export const DEFAULT_CREATE_PLAN_DRAFT: CreatePlanDraft = {
  basicInfo: {},
  content: { selectedSubtopicIdsByTopicId: {}, libraryItemIds: [] },
  schedule: {},
  assignment: { assignments: [], restDayIndexes: [] },
};

// Bumped to -v2: the Step 4 draft shape changed from an ordered row sequence
// to a day-indexed assignment list — old sessionStorage drafts under the
// previous key are incompatible and would crash the new reader.
export const CREATE_PLAN_DRAFT_STORAGE_KEY = "lurniva-create-plan-draft-v2";

/**
 * A stale/partial assignment (leftover from before `kind` existed, or
 * corrupted by a race between two tabs) must never crash the reader — tag
 * anything missing `kind` as a topic assignment (the only kind that existed
 * before), and drop anything that still doesn't look like either shape.
 */
function sanitizeAssignment(value: unknown): ScheduleAssignment | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ScheduleAssignment> & { kind?: unknown };
  if (typeof raw.assignmentId !== "string") return null;
  if (typeof raw.startDayIndex !== "number") return null;
  if (typeof raw.durationDays !== "number") return null;

  if (raw.kind === "chapter") {
    const chapter = raw as Partial<ChapterAssignment>;
    if (typeof chapter.libraryItemId !== "string") return null;
    if (typeof chapter.chapterId !== "string") return null;
    return {
      assignmentId: raw.assignmentId,
      kind: "chapter",
      libraryItemId: chapter.libraryItemId,
      chapterId: chapter.chapterId,
      startDayIndex: raw.startDayIndex,
      durationDays: raw.durationDays,
    };
  }

  const topic = raw as Partial<TopicAssignment>;
  if (typeof topic.topicId !== "string") return null;
  if (typeof topic.subjectId !== "string") return null;
  if (!Array.isArray(topic.subtopicIds)) return null;
  return {
    assignmentId: raw.assignmentId,
    kind: "topic",
    topicId: topic.topicId,
    subjectId: topic.subjectId,
    subtopicIds: topic.subtopicIds.filter(
      (id): id is string => typeof id === "string",
    ),
    startDayIndex: raw.startDayIndex,
    durationDays: raw.durationDays,
  };
}

/**
 * Normalizes whatever is actually in sessionStorage against the current
 * shape. A stale/partial draft (leftover from an older schema, or corrupted
 * by a race between two tabs) must never crash the reader — every array-
 * shaped field is validated and defaulted rather than trusted blindly.
 */
export function sanitizeCreatePlanDraft(value: unknown): CreatePlanDraft {
  const draft = (
    value && typeof value === "object" ? value : {}
  ) as Partial<CreatePlanDraft>;
  const content = draft.content as Partial<ContentSelectionDraft> | undefined;
  const assignment = draft.assignment as Partial<AssignDaysDraft> | undefined;

  return {
    basicInfo:
      draft.basicInfo && typeof draft.basicInfo === "object"
        ? draft.basicInfo
        : {},
    content: {
      selectedSubtopicIdsByTopicId:
        content?.selectedSubtopicIdsByTopicId &&
        typeof content.selectedSubtopicIdsByTopicId === "object"
          ? content.selectedSubtopicIdsByTopicId
          : {},
      libraryItemIds: Array.isArray(content?.libraryItemIds)
        ? content.libraryItemIds.filter(
            (id): id is string => typeof id === "string",
          )
        : [],
    },
    schedule:
      draft.schedule && typeof draft.schedule === "object"
        ? draft.schedule
        : {},
    assignment: {
      assignments: Array.isArray(assignment?.assignments)
        ? assignment.assignments
            .map(sanitizeAssignment)
            .filter((entry): entry is ScheduleAssignment => entry !== null)
        : [],
      restDayIndexes: Array.isArray(assignment?.restDayIndexes)
        ? assignment.restDayIndexes
        : [],
    },
  };
}

export const CREATE_PLAN_TOTAL_STEPS = [
  { label: "Basic Info", count: 1 },
  { label: "Select Content", count: 2 },
  { label: "Select Date Range", count: 3 },
  { label: "Assign Topics", count: 4 },
  { label: "Plan Review", count: 5 },
];

export const DAILY_STUDY_HOURS_OPTIONS = [1, 1.5, 2, 3, 4, 5] as const;
