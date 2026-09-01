import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@lurniva/db";
import { signUpSchema } from "@lurniva/validation";
import { fail, ok } from "~/lib/response";
import { supabaseAdmin } from "~/lib/supabase-admin.server";
import {
  checkVerificationCooldown,
  isEmailVerificationBypassed,
  sendVerificationEmail,
} from "~/lib/verification";

export const Route = createFileRoute("/api/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = signUpSchema.safeParse(body);
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
        const { email, password } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });

        const blocked = checkVerificationCooldown(existing);
        if (blocked) return blocked;

        const bypassed = isEmailVerificationBypassed();
        const now = new Date();

        if (!existing) {
          const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: bypassed,
          });
          if (error || !data.user) {
            return fail(
              { message: error?.message ?? "Could not create account", code: "CREATE_USER_FAILED" },
              { status: 400 },
            );
          }
          await prisma.user.create({
            data: {
              id: data.user.id,
              email,
              lastVerificationEmailSentAt: now,
              emailConfirmedAt: bypassed ? now : null,
            },
          });
        } else {
          await prisma.user.update({
            where: { email },
            data: {
              lastVerificationEmailSentAt: now,
              ...(bypassed ? { emailConfirmedAt: now } : {}),
            },
          });
          if (bypassed) {
            await supabaseAdmin.auth.admin.updateUserById(existing.id, {
              email_confirm: true,
            });
          }
        }

        if (bypassed) {
          return ok({ status: "verified" });
        }

        await sendVerificationEmail(email);

        return ok({ status: "verification-sent" });
      },
    },
  },
});
