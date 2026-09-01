import { createFileRoute } from "@tanstack/react-router";
import {
  AiStudySessionNotFoundError,
  deleteAiStudySession,
  getAiStudySession,
  updateAiStudySession,
} from "~/features/ai-study/services/ai-study-sessions";
import { StudyContextNotFoundError } from "~/features/ai-study/services/study-context";
import { updateAiStudySessionSchema } from "~/features/ai-study/validation/ai-study";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

/** One AI Study conversation: open it, reconfigure it, or remove it. */
export const Route = createFileRoute("/api/ai/sessions/$sessionId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        try {
          const session = await getAiStudySession(user.id, params.sessionId);
          return ok({ session });
        } catch (error) {
          if (error instanceof AiStudySessionNotFoundError) {
            return fail({ message: error.message, code: "NOT_FOUND" }, { status: 404 });
          }
          throw error;
        }
      },

      PATCH: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const parsed = updateAiStudySessionSchema.safeParse(body);
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
          const session = await updateAiStudySession(
            user.id,
            params.sessionId,
            parsed.data,
          );
          return ok({ session });
        } catch (error) {
          if (error instanceof AiStudySessionNotFoundError) {
            return fail({ message: error.message, code: "NOT_FOUND" }, { status: 404 });
          }
          if (error instanceof StudyContextNotFoundError) {
            return fail({ message: error.message, code: "NOT_FOUND" }, { status: 404 });
          }
          throw error;
        }
      },

      DELETE: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const deleted = await deleteAiStudySession(user.id, params.sessionId);
        if (!deleted) {
          return fail({ message: "Session not found", code: "NOT_FOUND" }, { status: 404 });
        }
        return ok({ deleted });
      },
    },
  },
});
