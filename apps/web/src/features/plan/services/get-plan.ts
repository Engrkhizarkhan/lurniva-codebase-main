import { prisma } from "@lurniva/db";
import type { Plan } from "../types";
import { toPlanDetail } from "./plan-mapper";

export async function getPlan(
  userId: string,
  planId: string,
): Promise<Plan | null> {
  let id: bigint;
  try {
    id = BigInt(planId);
  } catch {
    return null;
  }

  const plan = await prisma.studyPlan.findFirst({
    where: { id, userId },
    include: {
      days: {
        include: {
          tasks: {
            include: { topic: true, subtopic: true },
          },
        },
      },
    },
  });
  return plan ? toPlanDetail(plan) : null;
}
