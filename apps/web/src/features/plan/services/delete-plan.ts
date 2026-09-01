import { prisma } from "@lurniva/db";
import { findOwnedPlanId } from "./plan-ownership";

export async function deletePlan(
  userId: string,
  planId: string,
): Promise<void> {
  const id = await findOwnedPlanId(userId, planId);
  // Cascades to plan_days -> plan_tasks via FKs.
  await prisma.studyPlan.delete({ where: { id } });
}
