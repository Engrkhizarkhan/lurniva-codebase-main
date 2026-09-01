import { createFileRoute } from "@tanstack/react-router";
import { fail, ok } from "~/lib/response";
import { skillStore } from "~/store/model-store";

export const Route = createFileRoute("/api/model/skills/$skillId")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const skill = skillStore.get(params.skillId);
        if (!skill) {
          return fail(
            { message: "Skill not found", code: "NOT_FOUND" },
            { status: 404 },
          );
        }
        return ok({ skill });
      },
      DELETE: async ({ params }) => {
        const existed = Boolean(skillStore.get(params.skillId));
        skillStore.remove(params.skillId);
        return ok({ deleted: existed });
      },
      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
