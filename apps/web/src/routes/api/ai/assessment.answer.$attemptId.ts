import { createFileRoute } from "@tanstack/react-router";
import {
  AttemptNotFoundError,
  submitAssessmentAnswer,
} from "~/features/day-study/services/ai-assessment";
import { submitAnswerSchema } from "~/features/day-study/validation/ai";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/ai/assessment/answer/$attemptId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const parsed = submitAnswerSchema.safeParse(body);
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
          const result = await submitAssessmentAnswer(user.id, params.attemptId, parsed.data);
          return ok(result);
        } catch (error) {
          if (error instanceof AttemptNotFoundError) {
            return fail({ message: "Attempt not found", code: "NOT_FOUND" }, { status: 404 });
          }
          throw error;
        }
      },
    },
  },
});
