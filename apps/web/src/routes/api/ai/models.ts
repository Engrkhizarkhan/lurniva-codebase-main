import { createFileRoute } from "@tanstack/react-router";
import { getAvailableModels } from "~/server/ai/models";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

/** Models the study composer can pick from (auth-gated so it's not public data). */
export const Route = createFileRoute("/api/ai/models")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user)
          return fail({ message: "Unauthorized", code: "UNAUTHORIZED" }, { status: 401 });
        return ok({ models: getAvailableModels() });
      },
    },
  },
});