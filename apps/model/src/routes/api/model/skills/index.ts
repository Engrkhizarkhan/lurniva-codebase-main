import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fail, modelError, ok } from "~/lib/response";
import { distillSkill } from "~/features/model/services/book-to-skill";
import { skillStore } from "~/store/model-store";

const createSkillSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(40),
});

export const Route = createFileRoute("/api/model/skills/")({
  server: {
    handlers: {
      GET: () => {
        const skills = skillStore
          .list()
          .map(({ id, title, sourceType, createdAt, overview, chapters }) => ({
            id,
            title,
            sourceType,
            createdAt,
            overview,
            chapterCount: chapters.length,
          }));
        return ok({ skills });
      },

      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = createSkillSchema.safeParse(body);
        if (!parsed.success) {
          return fail(
            { message: "Provide non-empty content to structure." },
            { status: 422 },
          );
        }
        try {
          const skill = await distillSkill(parsed.data.content, {
            title: parsed.data.title,
          });
          skillStore.save(skill);
          return ok({ skill }, { status: 201 });
        } catch (error) {
          return modelError(error);
        }
      },

      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
