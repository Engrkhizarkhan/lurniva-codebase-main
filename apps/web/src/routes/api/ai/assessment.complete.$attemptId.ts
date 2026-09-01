import { createFileRoute } from "@tanstack/react-router";
import {
  AttemptNotFoundError,
  completeAssessmentAttempt,
} from "~/features/day-study/services/ai-assessment";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/ai/assessment/complete/$attemptId")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        try {
          const result = await completeAssessmentAttempt(user.id, params.attemptId);
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
