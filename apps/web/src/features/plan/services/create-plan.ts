import { prisma } from "@lurniva/db";
import type { CreatePlanInput } from "../validation/plan";
import type { Plan } from "../types";
import { loadChapterTitlesForAssignments } from "../../library/services/library-items";
import { buildPlanRows } from "./build-plan-rows";
import { toDbDate, toPlanSummary } from "./plan-mapper";
import { persistPlanDaysAndTasks } from "./persist-plan-rows";

export async function createPlan(
  userId: string,
  input: CreatePlanInput,
): Promise<Plan> {
  const { draft } = input;
  const chapterTitleByKey = await loadChapterTitlesForAssignments(
    userId,
    draft.assignment.assignments,
  );
  const built = buildPlanRows(draft, chapterTitleByKey);

  const plan = await prisma.$transaction(async (tx) => {
    const created = await tx.studyPlan.create({
      data: {
        userId,
        name: built.name,
        startDate: toDbDate(built.startDate),
        endDate: toDbDate(built.endDate),
        durationDays: built.durationDays,
        studyHoursPerDay: draft.basicInfo.dailyStudyHours,
        draftSnapshot: draft,
      },
    });

    await persistPlanDaysAndTasks(tx, created.id, built);

    return created;
  });

  return toPlanSummary(plan);
}
