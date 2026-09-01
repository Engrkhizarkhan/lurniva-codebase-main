import { prisma } from "@lurniva/db";
import { getAiProvider } from "~/server/ai";
import { buildDocumentFields } from "~/server/ai/document-response";
import { findOwnedPlanId } from "../../plan/services/plan-ownership";
import type { AiComposerMode, AiResponse, AiResponseStyle } from "../types";
import { appendAiMessage, getOrCreateAiSession } from "./ai-session";
import { buildGroundedDayContext, findPlanDay } from "./plan-day-lookup";

/**
 * Produces the rich `AiResponse` shown in the day-study chat, grounded on the
 * day's topics (and, when content is attached, the distilled source chapters).
 * The user message and the reply are persisted to the day's chat session so
 * reloads/context show the same history.
 */

export async function prepareConversationResponse(
  userId: string,
  planId: string,
  dayNumber: number,
  message: string,
  mode: AiComposerMode,
  responseStyle?: AiResponseStyle,
  model?: string,
): Promise<AiResponse> {
  const planDbId = await findOwnedPlanId(userId, planId);
  const day = await findPlanDay(planDbId, dayNumber);
  const session = await getOrCreateAiSession(userId, day.id, "chat", "chat");

  const history = await prisma.aiMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "asc" },
  });

  await appendAiMessage(session.id, "user", message);

  const provider = getAiProvider(model);
  const context = await buildGroundedDayContext(userId, day, message);

  const reply = await provider.completeConversation({
    ...context,
    mode,
    responseStyle,
    model,
    history: history.map((entry) => ({
      role: entry.role as "user" | "assistant",
      content: entry.content,
    })),
    message,
  });

  await appendAiMessage(session.id, "assistant", reply.message);

  const { isLong, document } = buildDocumentFields({
    reply,
    responseStyle,
    fallbackTitle:
      context.topics[0]?.subtopicLabel ?? context.topics[0]?.topicLabel ?? context.planName,
  });

  const id = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    id,
    message: reply.message,
    keyPoints: reply.keyPoints,
    sourceLabel: reply.sourceLabel,
    createdAt: new Date().toISOString(),
    isLong,
    ...(document ? { document } : {}),
    followUps: reply.followUps.map((followUp, index) => ({
      id: `${id}_fu${index + 1}`,
      label: followUp.label,
      prompt: followUp.prompt,
    })),
  };
}
