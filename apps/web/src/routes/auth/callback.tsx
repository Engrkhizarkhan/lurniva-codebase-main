import { createFileRoute } from "@tanstack/react-router";
import { buildPostAuthRedirect } from "~/server/user-profile";
import { createSupabaseServerClient } from "~/utils/supabase/server";
import { redirect } from "~/utils/redirect";

export const Route = createFileRoute("/auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");

        if (!code) {
          return redirect(
            new URL("/sign-in?error=oauth-failed", url.origin),
            303,
          );
        }

        const supabase = createSupabaseServerClient();
        const { data, error } =
          await supabase.auth.exchangeCodeForSession(code);

        if (error || !data.user?.email) {
          return redirect(
            new URL("/sign-in?error=oauth-failed", url.origin),
            303,
          );
        }

        return buildPostAuthRedirect(url.origin, {
          id: data.user.id,
          email: data.user.email,
        });
      },
    },
  },
});
