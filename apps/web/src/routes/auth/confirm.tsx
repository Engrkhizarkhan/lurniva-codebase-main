import { createFileRoute } from "@tanstack/react-router";
import type { EmailOtpType } from "@supabase/supabase-js";
import { buildPostAuthRedirect } from "~/server/user-profile";
import { createSupabaseServerClient } from "~/utils/supabase/server";
import { redirect } from "~/utils/redirect";

export const Route = createFileRoute("/auth/confirm")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const tokenHash = url.searchParams.get("token_hash");
        const type = url.searchParams.get("type") as EmailOtpType | null;

        if (!tokenHash || !type) {
          return redirect(
            new URL("/sign-in?error=link-expired", url.origin),
            303,
          );
        }

        const supabase = createSupabaseServerClient();
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error || !data.user?.email) {
          return redirect(
            new URL("/sign-in?error=link-expired", url.origin),
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
