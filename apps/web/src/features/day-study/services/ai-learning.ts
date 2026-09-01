import { getAiProvider } from "~/server/ai";
import { findOwnedPlanId } from "../../plan/services/plan-ownership";
import type { LearningFeature } from "../types";
import { appendAiMessage, getOrCreateAiSession } from "./ai-session";
import { buildGroundedDayContext, findPlanDay } from "./plan-day-lookup";

/** See `prepareChatReplyStream` for why setup happens outside the generator. */
export async function prepareLearningContentStream(
  userId: string,
  planId: string,
  dayNumber: number,
  feature: LearningFeature,
  model?: string,
): Promise<AsyncGenerator<string>> {
  const planDbId = await findOwnedPlanId(userId, planId);
  const day = await findPlanDay(planDbId, dayNumber);
  const session = await getOrCreateAiSession(userId, day.id, "learning", feature);

  const provider = getAiProvider(model);
  const context = await buildGroundedDayContext(userId, day, feature);

  async function* generate() {
    let full = "";
    for await (const chunk of provider.streamLongForm({ ...context, feature, model })) {
      full += chunk;
      yield chunk;
    }
    await appendAiMessage(session.id, "assistant", full);
  }

  return generate();
}
