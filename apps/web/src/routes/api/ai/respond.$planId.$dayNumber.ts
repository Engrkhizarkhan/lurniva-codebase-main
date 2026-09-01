import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { prepareConversationResponse } from "~/features/day-study/services/ai-respond";
import { DayNotFoundError } from "~/features/day-study/services/plan-day-lookup";
import { parseStringNumber } from "~/features/day-study/lib/parse-day-number";
import { responseStyleSchema } from "~/features/day-study/validation/ai";
import { PlanNotFoundError } from "~/features/plan/services/plan-ownership";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

const respondSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4000),
  mode: z.enum(["guided", "exploratory", "concise"]).optional(),
  responseStyle: responseStyleSchema.optional(),
  model: z.string().trim().max(64).optional(),
});

/** Rich, grounded chat turn — returns the full `AiResponse` the chat UI renders. */
export const Route = createFileRoute("/api/ai/respond/$planId/$dayNumber")({
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
        const parsed = respondSchema.safeParse(body);
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
          const response = await prepareConversationResponse(
            user.id,
            params.planId,
            dayNumber,
            parsed.data.message,
            parsed.data.mode ?? "guided",
            parsed.data.responseStyle,
            parsed.data.model,
          );
          return ok({ response });
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
          const message =
            error instanceof Error ? error.message : "AI response failed.";
          return fail({ message, code: "AI_ERROR" }, { status: 502 });
        }
      },
    },
  },
});