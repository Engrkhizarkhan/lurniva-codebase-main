import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fail, modelError, ok } from "~/lib/response";
import { querySkill } from "~/features/model/services/query-skill";
import { skillStore } from "~/store/model-store";

const querySchema = z.object({
  question: z.string().min(3),
  history: z
    .array(
      z.object({ role: z.enum(["user", "assistant"]), content: z.string() }),
    )
    .optional(),
});

export const Route = createFileRoute("/api/model/skills/$skillId/query")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const skill = skillStore.get(params.skillId);
        if (!skill) {
          return fail(
            { message: "Skill not found", code: "NOT_FOUND" },
            { status: 404 },
          );
        }
        const body = await request.json().catch(() => null);
        const parsed = querySchema.safeParse(body);
        if (!parsed.success) {
          return fail(
            { message: "Please ask a question (min 3 characters)." },
            { status: 422 },
          );
        }
        try {
          const result = await querySkill(skill, {
            question: parsed.data.question,
            history: parsed.data.history,
          });
          return ok({ result });
        } catch (error) {
          return modelError(error);
        }
      },
      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
