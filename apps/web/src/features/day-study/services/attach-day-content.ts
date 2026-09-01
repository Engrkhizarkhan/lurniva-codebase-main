import { prisma, type Prisma } from "@lurniva/db";
import { findOwnedPlanId } from "../../plan/services/plan-ownership";
import { CONTENT_SESSION_FEATURE, CONTENT_SESSION_MODE, type DayContentRecord, type SkillDocLike } from "~/server/ai/grounding";
import { distillViaModelApp } from "~/server/ai/distill";
import { getOrCreateAiSession } from "./ai-session";
import { findPlanDay } from "./plan-day-lookup";

/**
 * Attaches source material to a study day: the text is distilled into a
 * structured skill (overview + chapters + glossary) by the model service, and
 * the result is persisted in the day's content session metadata so chat,
 * learning and assessments can ground on it.
 */

export async function attachDayContent(params: {
  userId: string;
  planId: string;
  dayNumber: number;
  title?: string;
  text: string;
}): Promise<{ record: DayContentRecord; skill: SkillDocLike }> {
  const planDbId = await findOwnedPlanId(params.userId, params.planId);
  const day = await findPlanDay(planDbId, params.dayNumber);
  const title = params.title?.trim() || day.plan.name;

  const skill = await distillViaModelApp(title, params.text);

  const record: DayContentRecord = {
    title,
    sourceText: params.text.slice(0, 200_000),
    skill,
    attachedAt: new Date().toISOString(),
  };

  const session = await getOrCreateAiSession(
    params.userId,
    day.id,
    CONTENT_SESSION_MODE,
    CONTENT_SESSION_FEATURE,
  );
  await prisma.aiSession.update({
    where: { id: session.id },
    data: { metadata: record as unknown as Prisma.InputJsonValue },
  });

  return { record, skill };
}

export async function getDayContentRecord(
  userId: string,
  planId: string,
  dayNumber: number,
): Promise<DayContentRecord | null> {
  const planDbId = await findOwnedPlanId(userId, planId);
  const day = await findPlanDay(planDbId, dayNumber);
  const session = await prisma.aiSession.findUnique({
    where: {
      planDayId_mode_feature: {
        planDayId: day.id,
        mode: CONTENT_SESSION_MODE,
        feature: CONTENT_SESSION_FEATURE,
      },
    },
    select: { metadata: true },
  });
  if (!session) return null;
  const record = session.metadata as Partial<DayContentRecord> | null;
  if (!record?.skill || !Array.isArray(record.skill.chapters)) return null;
  return record as DayContentRecord;
}

export async function deleteDayContentRecord(
  userId: string,
  planId: string,
  dayNumber: number,
): Promise<boolean> {
  const planDbId = await findOwnedPlanId(userId, planId);
  const day = await findPlanDay(planDbId, dayNumber);
  const result = await prisma.aiSession.deleteMany({
    where: {
      planDayId: day.id,
      mode: CONTENT_SESSION_MODE,
      feature: CONTENT_SESSION_FEATURE,
      userId,
    },
  });
  return result.count > 0;
}

export type { SkillDocLike } from "~/server/ai/grounding";