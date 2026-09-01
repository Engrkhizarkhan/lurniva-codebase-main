import { createFileRoute } from "@tanstack/react-router";
import { StudyContextNotFoundError } from "~/features/ai-study/services/study-context";
import {
  createAiStudySession,
  listAiStudySessions,
} from "~/features/ai-study/services/ai-study-sessions";
import { createAiStudySessionSchema } from "~/features/ai-study/validation/ai-study";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

/** The user's AI Study conversations: the history list, and starting a new one. */
export const Route = createFileRoute("/api/ai/sessions/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const sessions = await listAiStudySessions(user.id);
        return ok({ sessions });
      },

      POST: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const parsed = createAiStudySessionSchema.safeParse(body);
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
          const session = await createAiStudySession(user.id, parsed.data);
          return ok({ session }, { status: 201 });
        } catch (error) {
          if (error instanceof StudyContextNotFoundError) {
            return fail({ message: error.message, code: "NOT_FOUND" }, { status: 404 });
          }
          throw error;
        }
      },
    },
  },
});
