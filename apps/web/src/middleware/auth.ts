import { createMiddleware } from "@tanstack/react-start";
import { fail } from "~/lib/response";
import { getUserFromAuthHeader } from "~/lib/supabase-admin.server";

/** Endpoints that must stay reachable before the caller has a session. */
const PUBLIC_API_PATHS = new Set(["/api/auth/register", "/api/auth/resend"]);

export const apiAuthMiddleware = createMiddleware({ type: "request" }).server(
  async ({ request, pathname, next }) => {
    if (pathname.startsWith("/api/") && !PUBLIC_API_PATHS.has(pathname)) {
      const user = await getUserFromAuthHeader(request);
      if (!user) {
        return fail(
          { message: "Unauthorized", code: "UNAUTHORIZED" },
          { status: 401 },
        );
      }
    }
    return next();
  },
);
