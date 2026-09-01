import { prisma } from "@lurniva/db";
import type { ReplacePlanInput } from "../validation/plan";
import type { Plan } from "../types";
import { loadChapterTitlesForAssignments } from "../../library/services/library-items";
import { buildPlanRows } from "./build-plan-rows";
import { toDbDate, toPlanSummary } from "./plan-mapper";
import { persistPlanDaysAndTasks } from "./persist-plan-rows";
import { findOwnedPlanId } from "./plan-ownership";

/** Full-wizard edit: replaces the plan's days/tasks wholesale, matching `createPlan`'s expansion. */
export async function replacePlan(
  userId: string,
  planId: string,
  input: ReplacePlanInput,
): Promise<Plan> {
  const id = await findOwnedPlanId(userId, planId);
  const { draft } = input;
  const chapterTitleByKey = await loadChapterTitlesForAssignments(
    userId,
    draft.assignment.assignments,
  );
  const built = buildPlanRows(draft, chapterTitleByKey);

  const plan = await prisma.$transaction(async (tx) => {
    // Cascades to plan_tasks via the plan_days -> plan_tasks FK.
    await tx.planDay.deleteMany({ where: { planId: id } });

    const updated = await tx.studyPlan.update({
      where: { id },
      data: {
        name: built.name,
        startDate: toDbDate(built.startDate),
        endDate: toDbDate(built.endDate),
        durationDays: built.durationDays,
        studyHoursPerDay: draft.basicInfo.dailyStudyHours,
        draftSnapshot: draft,
      },
    });

    await persistPlanDaysAndTasks(tx, id, built);

    return updated;
  });

  return toPlanSummary(plan);
}
