import { createFileRoute } from "@tanstack/react-router";
import { listStudySources } from "~/features/ai-study/services/study-context";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

/** Everything the AI Study topic picker offers: catalog, library and plan days. */
export const Route = createFileRoute("/api/ai/study-sources")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        }

        const sources = await listStudySources(user.id);
        return ok(sources);
      },
    },
  },
});
