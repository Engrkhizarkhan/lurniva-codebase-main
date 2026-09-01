import { prisma } from "@lurniva/db";

export class PlanNotFoundError extends Error {
  constructor() {
    super("Plan not found");
  }
}

/** Resolves `planId` to a bigint and confirms it belongs to `userId`, or throws `PlanNotFoundError`. */
export async function findOwnedPlanId(
  userId: string,
  planId: string,
): Promise<bigint> {
  let id: bigint;
  try {
    id = BigInt(planId);
  } catch {
    throw new PlanNotFoundError();
  }

  const plan = await prisma.studyPlan.findFirst({
    where: { id, userId },
    select: { id: true },
  });
  if (!plan) throw new PlanNotFoundError();

  return id;
}
