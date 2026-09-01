import { createServerClient } from "@supabase/ssr";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import {
  getCookies,
  setCookie,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { getIsOnboarded } from "~/server/user-profile";

/**
 * Wrapped in `createServerOnlyFn` so the compiler splits this (and its
 * `@tanstack/react-start/server` import) out of the client bundle entirely,
 * instead of leaving it to the generic import-protection mock. Needed
 * because callback.tsx/confirm.tsx call this directly from `server.handlers`,
 * which — unlike `createServerFn` results — isn't auto-split on its own.
 * Built fresh per call (never module-level) — it reads the current request's cookies.
 */
export const createSupabaseServerClient = createServerOnlyFn(() => {
  return createServerClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(getCookies()).map(([name, value]) => ({
            name,
            value,
          }));
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value, options }) => {
            setCookie(name, value, options);
          });
          Object.entries(headers ?? {}).forEach(([name, value]) => {
            setResponseHeader(name, value);
          });
        },
      },
    },
  );
});

export interface AuthContext {
  user: { id: string; email?: string } | null;
  isOnboarded: boolean;
}

/**
 * Wrapped in `createServerFn` so it always executes server-side even when a
 * `beforeLoad` runs during client-side navigation (where `getCookies()`
 * would otherwise be undefined).
 */
export const getAuthContext = createServerFn({ method: "GET" }).handler(
  async (): Promise<AuthContext> => {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
      return { user: null, isOnboarded: false };
    }

    const userId = data.claims.sub as string;
    const isOnboarded = await getIsOnboarded(userId);
    return {
      user: { id: userId, email: data.claims.email as string | undefined },
      isOnboarded,
    };
  },
);
