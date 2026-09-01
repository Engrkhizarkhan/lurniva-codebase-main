import { fail } from "~/lib/response";
import { supabaseAdmin } from "~/lib/supabase-admin.server";
import { sendMail } from "~/lib/zeptomail";

export const RESEND_COOLDOWN_MS = 60_000;

// TEMPORARY: ZeptoMail sending is broken on our account. Set
// SKIP_EMAIL_VERIFICATION=true to auto-confirm new signups instead of
// sending a verification email, so registration/onboarding stay unblocked.
// Remove this + the SKIP_EMAIL_VERIFICATION env var once ZeptoMail is fixed.
export function isEmailVerificationBypassed(): boolean {
  return process.env.SKIP_EMAIL_VERIFICATION === "true";
}

/**
 * Checks whether a registration/resend attempt should be blocked, given the
 * existing `users` row (if any) for that email. Returns the response to send
 * back if blocked, or `null` if the caller may proceed.
 */
export function checkVerificationCooldown(
  existing: {
    emailConfirmedAt: Date | null;
    lastVerificationEmailSentAt: Date | null;
  } | null,
): Response | null {
  if (existing?.emailConfirmedAt) {
    return fail(
      { message: "This email is already registered.", code: "ALREADY_REGISTERED" },
      { status: 409 },
    );
  }

  if (existing?.lastVerificationEmailSentAt) {
    const elapsedMs = Date.now() - existing.lastVerificationEmailSentAt.getTime();
    if (elapsedMs < RESEND_COOLDOWN_MS) {
      return fail(
        {
          message: "Please wait before requesting another verification email.",
          code: "RATE_LIMITED",
          details: { retryAfterSeconds: Math.ceil((RESEND_COOLDOWN_MS - elapsedMs) / 1000) },
        },
        { status: 429 },
      );
    }
  }

  return null;
}

/**
 * Generates a Supabase magic-link token for `email` and sends the
 * confirmation email via ZeptoMail. `magiclink` (not `signup`) is used so
 * resending never needs the user's password — completing the OTP still
 * confirms the email as a side effect.
 */
export async function sendVerificationEmail(email: string): Promise<void> {
  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
    options: { redirectTo: `${process.env.SITE_URL}/auth/confirm` },
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to generate verification link");
  }

  const confirmUrl = new URL(`${process.env.SITE_URL}/auth/confirm`);
  confirmUrl.searchParams.set("token_hash", data.properties.hashed_token);
  confirmUrl.searchParams.set("type", "magiclink");
  confirmUrl.searchParams.set("redirect_to", "/onboarding/profile");

  await sendMail({
    to: email,
    subject: "Confirm your email — Lurniva",
    htmlBody: `<p>Welcome to Lurniva! Click the link below to verify your email address:</p><p><a href="${confirmUrl.toString()}">Verify email</a></p><p>This link will expire shortly. If you didn't request this, you can ignore this email.</p>`,
  });
}
