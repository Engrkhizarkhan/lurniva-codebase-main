import type { Prisma, StudyPlan } from "@lurniva/db";
import type { CreatePlanDraft } from "../create-plan-types";
import type { Plan, PlanDayDetail, PlanItemStatus } from "../types";

function formatDbDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Prisma's `DateTime` input requires a full ISO-8601 datetime, not a bare "YYYY-MM-DD". */
export function toDbDate(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

/** List/edit response shape — a DB row mapped onto the client's `Plan` type. */
export function toPlanSummary(plan: StudyPlan): Plan {
  return {
    id: plan.id.toString(),
    name: plan.name,
    startDate: formatDbDate(plan.startDate),
    endDate: formatDbDate(plan.endDate),
    studyHoursPerDay: plan.studyHoursPerDay.toNumber(),
    draft: (plan.draftSnapshot as CreatePlanDraft | null) ?? undefined,
  };
}

type StudyPlanWithDays = Prisma.StudyPlanGetPayload<{
  include: {
    days: {
      include: { tasks: { include: { topic: true; subtopic: true } } };
    };
  };
}>;

/** Detail response shape — adds the real day/task completion state for the plan-detail page. */
export function toPlanDetail(plan: StudyPlanWithDays): Plan {
  const days: PlanDayDetail[] = [...plan.days]
    .sort((a, b) => a.dayNumber - b.dayNumber)
    .map((day) => ({
      dayNumber: day.dayNumber,
      scheduledDate: formatDbDate(day.scheduledDate),
      isRestDay: day.isRestDay,
      status: day.status as PlanItemStatus,
      tasks: [...day.tasks]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((task) => ({
          id: task.id.toString(),
          topicLabel: task.title ?? task.topic?.name ?? "Untitled",
          subtopicLabel: task.subtopic?.name ?? null,
          status: task.status as PlanItemStatus,
        })),
    }));

  return { ...toPlanSummary(plan), days };
}
