import { createFileRoute } from "@tanstack/react-router";
import { AiStudySessionNotFoundError } from "~/features/ai-study/services/ai-study-sessions";
import { prepareAiStudyReplyStream } from "~/features/ai-study/services/ai-study-respond";
import { StudyContextNotFoundError } from "~/features/ai-study/services/study-context";
import { aiStudyRespondSchema } from "~/features/ai-study/validation/ai-study";
import { fail } from "~/lib/response";
import { streamEventsToSseResponse } from "~/lib/sse-response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

/**
 * One grounded chat turn, streamed: text deltas as the answer is written, then
 * a closing frame with the same `AiResponse` the chat UI renders. Setup errors
 * still come back as a normal JSON failure — the stream only opens once the
 * turn is known to be valid.
 */
export const Route = createFileRoute("/api/ai/sessions/$sessionId/respond")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const parsed = aiStudyRespondSchema.safeParse(body);
        if (!parsed.success) {
          return fail(
            {
              message: "Invalid request body",
              code: "VALIDATION_ERROR",
              details: { issues: parsed.error.issues },
            },
            { status: 422 },
          );
        }

        try {
          const events = await prepareAiStudyReplyStream(
            user.id,
            params.sessionId,
            parsed.data.message,
            {
              mode: parsed.data.mode,
              responseStyle: parsed.data.responseStyle,
              model: parsed.data.model,
            },
          );
          return streamEventsToSseResponse(events);
        } catch (error) {
          if (
            error instanceof AiStudySessionNotFoundError ||
            error instanceof StudyContextNotFoundError
          ) {
            return fail({ message: error.message, code: "NOT_FOUND" }, { status: 404 });
          }
          const message = error instanceof Error ? error.message : "AI response failed.";
          return fail({ message, code: "AI_ERROR" }, { status: 502 });
        }
      },
    },
  },
});
