import { createFileRoute } from "@tanstack/react-router";
import { Prisma } from "@lurniva/db";
import { createPlanSchema } from "~/features/plan/validation/plan";
import { listPlans } from "~/features/plan/services/list-plans";
import { createPlan } from "~/features/plan/services/create-plan";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/plans/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }

        const rawPage = Number(new URL(request.url).searchParams.get("page"));
        const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

        const result = await listPlans(user.id, page);
        return ok(result);
      },
      POST: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }

        const body = await request.json().catch(() => null);
        const parsed = createPlanSchema.safeParse(body);
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
          const plan = await createPlan(user.id, parsed.data);
          return ok(plan, { status: 201 });
        } catch (error) {
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
    },
  },
});
