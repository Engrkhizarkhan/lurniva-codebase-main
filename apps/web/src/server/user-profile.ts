import { prisma } from "@lurniva/db";
import { redirect } from "~/utils/redirect";

/**
 * Idempotently creates (or touches) the `users` row for an authenticated
 * Supabase user. Called right after `verifyOtp`/`exchangeCodeForSession`
 * succeeds — both cases prove current ownership of the email.
 */
export async function ensureUserProfile({
  id,
  email,
}: {
  id: string;
  email: string;
}): Promise<{ isOnboarded: boolean }> {
  const user = await prisma.user.upsert({
    where: { id },
    create: { id, email, emailConfirmedAt: new Date() },
    update: { emailConfirmedAt: new Date() },
  });

  return { isOnboarded: user.isOnboarded };
}

export async function getIsOnboarded(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.isOnboarded ?? false;
}

/** Shared tail for both `/auth/confirm` and `/auth/callback`: ensure the profile row exists, then redirect. */
export async function buildPostAuthRedirect(
  origin: string,
  user: { id: string; email: string },
): Promise<Response> {
  const { isOnboarded } = await ensureUserProfile(user);
  return redirect(
    new URL(isOnboarded ? "/" : "/onboarding/profile", origin),
    303,
  );
}
