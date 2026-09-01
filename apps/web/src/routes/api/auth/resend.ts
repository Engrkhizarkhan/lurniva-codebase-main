import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "@lurniva/db";
import { resendVerificationSchema } from "@lurniva/validation";
import { fail, ok } from "~/lib/response";
import { checkVerificationCooldown, sendVerificationEmail } from "~/lib/verification";

export const Route = createFileRoute("/api/auth/resend")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = resendVerificationSchema.safeParse(body);
        if (!parsed.success) {
          return fail(
            { message: "Invalid request body", code: "VALIDATION_ERROR" },
            { status: 422 },
          );
        }
        const { email } = parsed.data;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (!existing) {
          // Don't reveal whether this email has a pending registration.
          return ok({ status: "verification-sent" });
        }

        const blocked = checkVerificationCooldown(existing);
        if (blocked) return blocked;

        await prisma.user.update({
          where: { email },
          data: { lastVerificationEmailSentAt: new Date() },
        });

        await sendVerificationEmail(email);

        return ok({ status: "verification-sent" });
      },
    },
  },
});
