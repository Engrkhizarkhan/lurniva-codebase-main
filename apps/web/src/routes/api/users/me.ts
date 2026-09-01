import { createFileRoute } from "@tanstack/react-router";
import { completeOnboardingSchema } from "~/features/onboarding/validation";
import { completeOnboarding } from "~/features/onboarding/services/complete-onboarding";
import { fail, ok } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

export const Route = createFileRoute("/api/users/me")({
  server: {
    handlers: {
      PATCH: async ({ request }) => {
        const user = await getUserFromAuthHeader(request);
        if (!user) {
          return fail(
            { message: "Unauthorized", code: "UNAUTHORIZED" },
            { status: 401 },
          );
        }

        const body = await request.json().catch(() => null);
        const parsed = completeOnboardingSchema.safeParse(body);
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

        const updated = await completeOnboarding(user.id, parsed.data);
        return ok(updated);
      },
    },
  },
});
