import { createFileRoute } from "@tanstack/react-router";
import { prepareLearningContentStream } from "~/features/day-study/services/ai-learning";
import { DayNotFoundError } from "~/features/day-study/services/plan-day-lookup";
import { parseStringNumber } from "~/features/day-study/lib/parse-day-number";
import { generateLearningSchema } from "~/features/day-study/validation/ai";
import { PlanNotFoundError } from "~/features/plan/services/plan-ownership";
import { fail } from "~/lib/response";
import { streamToSseResponse } from "~/lib/sse-response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/ai/learning/$planId/$dayNumber")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }

        const dayNumber = parseStringNumber(params.dayNumber);
        if (dayNumber === null) {
          return fail(
            { message: "Invalid day number", code: "VALIDATION_ERROR" },
            { status: 422 },
          );
        }

        const body = await request.json().catch(() => null);
        const parsed = generateLearningSchema.safeParse(body);
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
          const chunks = await prepareLearningContentStream(
            user.id,
            params.planId,
            dayNumber,
            parsed.data.feature,
            parsed.data.model,
          );
          return streamToSseResponse(chunks);
        } catch (error) {
          if (
            error instanceof PlanNotFoundError ||
            error instanceof DayNotFoundError
          ) {
            return fail(
              { message: "Day not found", code: "NOT_FOUND" },
              { status: 404 },
            );
          }
          throw error;
        }
      },
    },
  },
});
