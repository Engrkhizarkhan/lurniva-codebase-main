import { prisma } from "@lurniva/db";
import { createFileRoute } from "@tanstack/react-router";
import { createUserSchema } from "@lurniva/validation";
import { corsMiddleware } from "~/middleware/cors";
import { fail, ok } from "~/lib/response";

export const Route = createFileRoute("/api/users")({
  server: {
    middleware: [corsMiddleware],
    handlers: {
      GET: async () => {
        const users = await prisma.user.findMany({
          orderBy: { createdAt: "desc" },
        });
        return ok(users);
      },
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = createUserSchema.safeParse(body);
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

        const user = await prisma.user.create({ data: parsed.data });
        return ok(user, { status: 201 });
      },
      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
