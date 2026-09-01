import { prisma } from "@lurniva/db";
import { getAiProvider } from "~/server/ai";
import { findOwnedPlanId } from "../../plan/services/plan-ownership";
import { appendAiMessage, getOrCreateAiSession } from "./ai-session";
import { buildGroundedDayContext, findPlanDay } from "./plan-day-lookup";

/**
 * Resolves ownership and persists the user message up front (so the route
 * can turn a not-found/auth failure into a clean error response), then
 * returns a generator that streams the assistant's reply and persists the
 * full text once exhausted. Async generator bodies don't start running until
 * iterated, so this setup work must happen outside the generator itself.
 */
export async function prepareChatReplyStream(
  userId: string,
  planId: string,
  dayNumber: number,
  message: string,
  model?: string,
): Promise<AsyncGenerator<string>> {
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

  async function* generate() {
    let full = "";
    for await (const chunk of provider.streamChat({
      ...context,
      model,
      history: history.map((entry) => ({
        role: entry.role as "user" | "assistant",
        content: entry.content,
      })),
      message,
    })) {
      full += chunk;
      yield chunk;
    }
    await appendAiMessage(session.id, "assistant", full);
  }

  return generate();
}
