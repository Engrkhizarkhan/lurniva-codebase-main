import { createFileRoute } from "@tanstack/react-router";
import { getDayStudyContext } from "~/features/day-study/services/get-day-study-context";
import { DayNotFoundError } from "~/features/day-study/services/plan-day-lookup";
import { parseStringNumber } from "~/features/day-study/lib/parse-day-number";
import { PlanNotFoundError } from "~/features/plan/services/plan-ownership";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/ai/context/$planId/$dayNumber")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
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

        try {
          const context = await getDayStudyContext(
            user.id,
            params.planId,
            dayNumber,
          );
          return ok(context);
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
