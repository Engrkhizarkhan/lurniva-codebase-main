import { prisma } from "@lurniva/db";
import { PLANS_PAGE_SIZE } from "../types";
import type { Plan } from "../types";
import { toPlanSummary } from "./plan-mapper";

export interface ListPlansResult {
  plans: Plan[];
  totalCount: number;
  totalPages: number;
  page: number;
}

export async function listPlans(
  userId: string,
  rawPage: number,
): Promise<ListPlansResult> {
  const totalCount = await prisma.studyPlan.count({ where: { userId } });
  const totalPages = Math.max(1, Math.ceil(totalCount / PLANS_PAGE_SIZE));
  const page = Math.min(Math.max(1, rawPage), totalPages);

  const rows = await prisma.studyPlan.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * PLANS_PAGE_SIZE,
    take: PLANS_PAGE_SIZE,
  });

  return { plans: rows.map(toPlanSummary), totalCount, totalPages, page };
}
