import type { CreatePlanDraft } from "./create-plan-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanSession {
  sessionId: string;
  kind: "topic" | "rest";
  subjectLabel?: string;
  topicLabel?: string;
  subtopicLabels?: string[];
  dayStart: number;
  dayEnd: number;
  startDate: string;
  endDate: string;
}

/** Mirrors the `status` column on `plan_days`/`plan_tasks`. */
export type PlanItemStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface PlanTaskDetail {
  id: string;
  topicLabel: string;
  subtopicLabel: string | null;
  status: PlanItemStatus;
}

export interface PlanDayDetail {
  dayNumber: number;
  /** ISO date string, e.g. "2025-05-20" */
  scheduledDate: string;
  isRestDay: boolean;
  status: PlanItemStatus;
  tasks: PlanTaskDetail[];
}

export interface Plan {
  id: string;
  name: string;
  /** ISO date string, e.g. "2025-05-20" */
  startDate: string;
  /** ISO date string, e.g. "2025-06-20" */
  endDate: string;
  studyHoursPerDay: number;
  /** Day-by-day schedule built in the Assign Days step — optional so existing/mock plans stay valid. */
  sessions?: PlanSession[];
  totalTopics?: number;
  restDayCount?: number;
  /** Full wizard draft as authored — lets the edit flow rehydrate byte-for-byte. Absent on plans that predate this. */
  draft?: CreatePlanDraft;
  /** Real day/task completion state — populated by the plan-detail fetch. */
  days?: PlanDayDetail[];
}

export type PlanFormValues = Omit<Plan, "id">;

export type PlansListStatus = "loading" | "error" | "empty" | "ready";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const PLANS_STORAGE_KEY = "lurniva-plans";
export const PLANS_PAGE_SIZE = 10;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getDurationDays(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  return Math.max(1, Math.round((end - start) / MS_PER_DAY) + 1);
}

const dateRangeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatDateRange(startDate: string, endDate: string): string {
  return `${dateRangeFormatter.format(new Date(startDate))} – ${dateRangeFormatter.format(new Date(endDate))}`;
}
