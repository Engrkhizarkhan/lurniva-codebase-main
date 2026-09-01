import { createFileRoute } from "@tanstack/react-router";
import { Prisma } from "@lurniva/db";
import {
  replacePlanSchema,
  updatePlanQuickSchema,
} from "~/features/plan/validation/plan";
import { getPlan } from "~/features/plan/services/get-plan";
import { replacePlan } from "~/features/plan/services/replace-plan";
import { updatePlanFields } from "~/features/plan/services/update-plan-fields";
import { deletePlan } from "~/features/plan/services/delete-plan";
import { PlanNotFoundError } from "~/features/plan/services/plan-ownership";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

const NOT_FOUND = fail(
  { message: "Plan not found", code: "NOT_FOUND" },
  { status: 404 },
);

export const Route = createFileRoute("/api/plans/$planId")({
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

        const plan = await getPlan(user.id, params.planId);
        if (!plan) return NOT_FOUND;
        return ok(plan);
      },
      PATCH: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }

        const body = await request.json().catch(() => null);
        const parsed = updatePlanQuickSchema.safeParse(body);
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
          const plan = await updatePlanFields(user.id, params.planId, parsed.data);
          return ok(plan);
        } catch (error) {
          if (error instanceof PlanNotFoundError) return NOT_FOUND;
          throw error;
        }
      },
      PUT: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }

        const body = await request.json().catch(() => null);
        const parsed = replacePlanSchema.safeParse(body);
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
          const plan = await replacePlan(user.id, params.planId, parsed.data);
          return ok(plan);
        } catch (error) {
          if (error instanceof PlanNotFoundError) return NOT_FOUND;
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003"
          ) {
            return fail(
              {
                message: "One of the selected topics or subtopics no longer exists",
                code: "INVALID_REFERENCE",
              },
              { status: 422 },
            );
          }
          throw error;
        }
      },
      DELETE: async ({ request, params }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }

        try {
          await deletePlan(user.id, params.planId);
          return ok({ deleted: true });
        } catch (error) {
          if (error instanceof PlanNotFoundError) return NOT_FOUND;
          throw error;
        }
      },
    },
  },
});
