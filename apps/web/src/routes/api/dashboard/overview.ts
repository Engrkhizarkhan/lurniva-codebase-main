import { createFileRoute } from "@tanstack/react-router";
import { getDashboardOverview } from "~/features/dashboard/services/dashboard-overview";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/dashboard/overview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }
        try {
          const overview = await getDashboardOverview(user.id);
          return ok({ overview });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Failed to load dashboard.";
          return fail({ message, code: "DASHBOARD_ERROR" }, { status: 500 });
        }
      },
    },
  },
});
