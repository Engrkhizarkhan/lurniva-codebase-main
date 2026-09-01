import { prisma } from "@lurniva/db";
import { getAiProvider } from "~/server/ai";
import type { StructuredReply } from "~/server/ai/ai-provider";
import { buildDocumentFields } from "~/server/ai/document-response";
import { appendAiMessage } from "../../day-study/services/ai-session";
import type { AiComposerMode, AiResponse, AiResponseStyle } from "../../day-study/types";
import {
  ensureSessionTitle,
  findOwnedAiStudySession,
  readSessionConfig,
} from "./ai-study-sessions";
import { resolveStudyContext } from "./study-context";

/**
 * One grounded chat turn inside an AI Study session.
 *
 * The day-study page has the same seam in `ai-respond.ts`; this is that flow
 * with the session's own stored topic context and response style in place of a
 * plan day, so both routes produce the identical `AiResponse` the chat UI
 * renders and there is only one chat system in the product.
 */

/** The provider's reply in the shape the chat UI renders. */
function toAiResponse(
  reply: StructuredReply,
  fallbackSourceLabel: string | null,
  responseStyle: AiResponseStyle | null | undefined,
  fallbackTitle: string,
): AiResponse {
  const id = `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const { isLong, document } = buildDocumentFields({ reply, responseStyle, fallbackTitle });
  return {
    id,
    message: reply.message,
    keyPoints: reply.keyPoints,
    sourceLabel: reply.sourceLabel ?? fallbackSourceLabel,
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

/** What the streaming route sends down the wire, frame by frame. */
export type AiStudyStreamEvent =
  | { kind: "delta"; text: string }
  | { kind: "response"; response: AiResponse };

/**
 * The streaming form of the turn above.
 *
 * Ownership, history and the user's message are resolved up front so the route
 * can still answer a not-found with a clean error rather than a half-open
 * stream — async generator bodies don't run until they are iterated, so that
 * work cannot live inside the generator. The assistant's message is persisted
 * once the stream completes, exactly as the day-study chat stream does.
 */
export async function prepareAiStudyReplyStream(
  userId: string,
  sessionId: string,
  message: string,
  options: { mode?: AiComposerMode; responseStyle?: AiResponseStyle; model?: string } = {},
): Promise<AsyncGenerator<AiStudyStreamEvent>> {
  const session = await findOwnedAiStudySession(userId, sessionId);
  const config = readSessionConfig(session);

  const history = await prisma.aiMessage.findMany({
    where: { sessionId: session.id },
    orderBy: { createdAt: "asc" },
  });

  await ensureSessionTitle(session, message);
  await appendAiMessage(session.id, "user", message);

  const { summary, topic } = await resolveStudyContext(userId, config.context, message);
  const provider = getAiProvider(options.model);
  const effectiveResponseStyle = options.responseStyle ?? config.responseStyle ?? undefined;

  async function* generate(): AsyncGenerator<AiStudyStreamEvent> {
    for await (const chunk of provider.streamConversation({
      ...topic,
      mode: options.mode ?? "guided",
      responseStyle: effectiveResponseStyle,
      model: options.model,
      history: history.map((entry) => ({
        role: entry.role as "user" | "assistant",
        content: entry.content,
      })),
      message,
    })) {
      if (chunk.kind === "delta") {
        yield { kind: "delta", text: chunk.text };
        continue;
      }
      await appendAiMessage(session.id, "assistant", chunk.reply.message);
      yield {
        kind: "response",
        response: toAiResponse(
          chunk.reply,
          summary.sourceLabel,
          effectiveResponseStyle,
          summary.label,
        ),
      };
    }
  }

  return generate();
}
