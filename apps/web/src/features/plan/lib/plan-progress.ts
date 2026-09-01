import type { PlanDayDetail, PlanItemStatus, PlanTaskDetail } from "../types";

export interface PlanProgressStats {
  completedTasks: number;
  totalTasks: number;
  progressPct: number;
  completedDays: number;
  totalDays: number;
}

export function computePlanStats(days: PlanDayDetail[]): PlanProgressStats {
  const allTasks = days.flatMap((day) => day.tasks);
  const completedTasks = allTasks.filter(
    (task) => task.status === "completed",
  ).length;
  const totalTasks = allTasks.length;
  const completedDays = days.filter((day) => day.status === "completed").length;

  return {
    completedTasks,
    totalTasks,
    progressPct: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    completedDays,
    totalDays: days.length,
  };
}

export function getDayTaskProgressPct(day: PlanDayDetail): number {
  if (day.tasks.length === 0) return 0;
  const completed = day.tasks.filter((task) => task.status === "completed").length;
  return Math.round((completed / day.tasks.length) * 100);
}

export interface DaySummary {
  title: string;
  subtitle: string;
}

/** A day can carry tasks from more than one topic assignment — collapse them into one title/subtitle line. */
export function summarizeDayTasks(tasks: PlanTaskDetail[]): DaySummary {
  if (tasks.length === 0) {
    return { title: "No topics scheduled", subtitle: "" };
  }
  const topicLabels = Array.from(new Set(tasks.map((task) => task.topicLabel)));
  const detailLabels = Array.from(
    new Set(tasks.map((task) => task.subtopicLabel ?? task.topicLabel)),
  );
  return { title: topicLabels.join(" + "), subtitle: detailLabels.join(" · ") };
}

/**
 * The day "Start learning" should jump to: the day scheduled for today if
 * the plan covers it, otherwise the in-progress day, otherwise the next
 * pending day, otherwise the first study day. Rest days are skipped.
 */
export function getTodaysStudyDayNumber(days: PlanDayDetail[]): number | null {
  const studyDays = days.filter((day) => !day.isRestDay);
  if (studyDays.length === 0) return null;

  const todayIso = new Date().toISOString().slice(0, 10);
  const scheduledToday = studyDays.find((day) => day.scheduledDate === todayIso);
  if (scheduledToday) return scheduledToday.dayNumber;

  const inProgress = studyDays.find((day) => day.status === "in_progress");
  if (inProgress) return inProgress.dayNumber;

  const nextPending = studyDays.find((day) => day.status === "pending");
  if (nextPending) return nextPending.dayNumber;

  return studyDays[0]!.dayNumber;
}

export interface DayStatusMeta {
  label: string;
  toneClasses: string;
}

export function getDayStatusMeta(status: PlanItemStatus): DayStatusMeta {
  switch (status) {
    case "completed":
      return { label: "Completed", toneClasses: "bg-success-soft text-success" };
    case "in_progress":
      return { label: "In progress", toneClasses: "bg-accent-soft text-primary" };
    case "skipped":
      return { label: "Skipped", toneClasses: "bg-warning-soft text-warning" };
    default:
      return { label: "Upcoming", toneClasses: "bg-surface-sunken text-text-muted" };
  }
}
