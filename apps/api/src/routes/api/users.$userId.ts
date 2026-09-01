import { prisma } from "@lurniva/db";
import { createFileRoute } from "@tanstack/react-router";
import { updateUserSchema } from "@lurniva/validation";
import { corsMiddleware } from "~/middleware/cors";
import { fail, isNotFoundError, ok } from "~/lib/response";

export const Route = createFileRoute("/api/users/$userId")({
  server: {
    middleware: [corsMiddleware],
    handlers: {
      GET: async ({ params }) => {
        const user = await prisma.user.findUnique({
          where: { id: params.userId },
        });
        if (!user) {
          return fail(
            { message: "User not found", code: "NOT_FOUND" },
            { status: 404 },
          );
        }
        return ok(user);
      },
      PATCH: async ({ request, params }) => {
        const body = await request.json().catch(() => null);
        const parsed = updateUserSchema.safeParse(body);
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

        try {
          const user = await prisma.user.update({
            where: { id: params.userId },
            data: parsed.data,
          });
          return ok(user);
        } catch (error) {
          if (isNotFoundError(error)) {
            return fail(
              { message: "User not found", code: "NOT_FOUND" },
              { status: 404 },
            );
          }
          throw error;
        }
      },
      DELETE: async ({ params }) => {
        try {
          await prisma.user.delete({ where: { id: params.userId } });
          return new Response(null, { status: 204 });
        } catch (error) {
          if (isNotFoundError(error)) {
            return fail(
              { message: "User not found", code: "NOT_FOUND" },
              { status: 404 },
            );
          }
          throw error;
        }
      },
      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
