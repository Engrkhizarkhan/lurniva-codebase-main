import { prisma, type AiSession } from "@lurniva/db";
import type { AiMode } from "../types";

/** Get-or-create the single session for a (day, mode, feature) triple. */
export async function getOrCreateAiSession(
  userId: string,
  planDayId: bigint,
  mode: AiMode,
  feature: string,
): Promise<AiSession> {
  return prisma.aiSession.upsert({
    where: { planDayId_mode_feature: { planDayId, mode, feature } },
    update: {},
    create: { planDayId, userId, mode, feature },
  });
}

/**
 * Appends a turn and stamps the session's `lastMessageAt`, which is what the
 * AI Study history list sorts on — a session's recency is when it was last
 * spoken to, not when its row was last touched.
 */
export async function appendAiMessage(
  sessionId: bigint,
  role: "user" | "assistant",
  content: string,
) {
  const [message] = await prisma.$transaction([
    prisma.aiMessage.create({ data: { sessionId, role, content } }),
    prisma.aiSession.update({
      where: { id: sessionId },
      data: { lastMessageAt: new Date() },
    }),
  ]);
  return message;
}
