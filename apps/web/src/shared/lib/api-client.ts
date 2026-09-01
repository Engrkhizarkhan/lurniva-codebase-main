import type { ApiResult } from "@lurniva/types";
import { supabase } from "~/utils/supabase/client";

/**
 * Fetches an authenticated API route, attaching the current Supabase session
 * as a Bearer token the same way `useOnboardingSubmit.ts` does inline. Pulled
 * out here because the plan feature needs this at several call sites.
 */
export async function authFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<ApiResult<T>> {
  const { data } = await supabase.auth.getSession();
  const isMultipart =
    typeof FormData !== "undefined" && init.body instanceof FormData;
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(!isMultipart ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${data.session?.access_token}`,
      ...(init.headers as Record<string, string>),
    },
  });
  return (await response.json()) as ApiResult<T>;
}
