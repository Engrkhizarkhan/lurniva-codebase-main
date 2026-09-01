import { createFileRoute } from "@tanstack/react-router";
import { generateAiStudyAssessment } from "~/features/ai-study/services/ai-study-assessment";
import { AiStudySessionNotFoundError } from "~/features/ai-study/services/ai-study-sessions";
import { StudyContextNotFoundError } from "~/features/ai-study/services/study-context";
import { assessmentConfigSchema } from "~/features/ai-study/validation/ai-study";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

/**
 * Generates an assessment for a session. Answers and completion go to the
 * existing `/api/ai/assessment/answer/$attemptId` and
 * `/api/ai/assessment/complete/$attemptId` routes — attempts are keyed by id,
 * so there is one grading path for the whole product.
 */
export const Route = createFileRoute("/api/ai/sessions/$sessionId/assessment")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const body = await request.json().catch(() => null);
        const parsed = assessmentConfigSchema.safeParse(body);
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
          const assessment = await generateAiStudyAssessment(
            user.id,
            params.sessionId,
            parsed.data.feature,
            parsed.data.counts,
            parsed.data.model,
          );
          return ok(assessment, { status: 201 });
        } catch (error) {
          if (
            error instanceof AiStudySessionNotFoundError ||
            error instanceof StudyContextNotFoundError
          ) {
            return fail({ message: error.message, code: "NOT_FOUND" }, { status: 404 });
          }
          const message =
            error instanceof Error ? error.message : "Assessment generation failed.";
          return fail({ message, code: "AI_ERROR" }, { status: 502 });
        }
      },
    },
  },
});
