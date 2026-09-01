import { prisma } from "@lurniva/db";
import type { UpdatePlanQuickInput } from "../validation/plan";
import type { Plan } from "../types";
import { findOwnedPlanId } from "./plan-ownership";
import { toDbDate, toPlanSummary } from "./plan-mapper";

/**
 * Quick-edit (name/dates/study hours only) from the plans-list modal. Doesn't
 * regenerate `plan_days` if the dates change — matches the pre-existing
 * client behavior this replaces, which never touched day assignments either.
 */
export async function updatePlanFields(
  userId: string,
  planId: string,
  patch: UpdatePlanQuickInput,
): Promise<Plan> {
  const id = await findOwnedPlanId(userId, planId);

  const plan = await prisma.studyPlan.update({
    where: { id },
    data: {
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.startDate !== undefined && {
        startDate: toDbDate(patch.startDate),
      }),
      ...(patch.endDate !== undefined && { endDate: toDbDate(patch.endDate) }),
      ...(patch.studyHoursPerDay !== undefined && {
        studyHoursPerDay: patch.studyHoursPerDay,
      }),
    },
  });

  return toPlanSummary(plan);
}
