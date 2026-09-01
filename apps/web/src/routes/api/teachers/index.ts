import { createFileRoute } from "@tanstack/react-router";
import {
  listTeachersQuerySchema,
  parseSearchParams,
} from "@lurniva/validation";
import { listTeachers } from "~/features/teachers/services/teachers";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

/** Browse published teacher listings — one page per request. */
export const Route = createFileRoute("/api/teachers/")({
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

        const parsed = parseSearchParams(
          listTeachersQuerySchema,
          new URL(request.url).searchParams,
        );
        if (!parsed.success) {
          return fail(
            {
              message: "Invalid query parameters",
              code: "VALIDATION_ERROR",
              details: { issues: parsed.error.issues },
            },
            { status: 422 },
          );
        }

        try {
          return ok(await listTeachers(parsed.data));
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to load teachers.";
          return fail({ message, code: "TEACHERS_ERROR" }, { status: 500 });
        }
      },
    },
  },
});
