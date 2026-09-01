import { createFileRoute } from "@tanstack/react-router";
import { getCatalog } from "~/features/plan/services/catalog";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/catalog")({
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

        const subjects = await getCatalog();
        return ok(subjects);
      },
    },
  },
});
