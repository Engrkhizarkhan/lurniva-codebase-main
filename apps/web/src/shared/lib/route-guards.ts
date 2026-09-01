import { redirect } from "@tanstack/react-router";
import { getAuthContext } from "~/utils/supabase/server";
import type { AuthContext } from "~/utils/supabase/server";

export async function requireAuthenticated(): Promise<AuthContext> {
  const ctx = await getAuthContext();
  if (!ctx.user) throw redirect({ to: "/sign-in" });
  return ctx;
}

export async function requireOnboarded(): Promise<AuthContext> {
  const ctx = await requireAuthenticated();
  if (!ctx.isOnboarded) throw redirect({ to: "/onboarding/profile" });
  return ctx;
}
