import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fail, modelError, ok } from "~/lib/response";
import { buildStudyPlan } from "~/features/model/services/study-plan";
import { skillStore } from "~/store/model-store";

const planSchema = z.object({
  timeline: z.enum(["auto", "manual"]).default("auto"),
  startDate: z.string().optional(),
  hoursPerDay: z.number().int().min(1).max(12).optional(),
  daysPerWeek: z.number().int().min(1).max(7).optional(),
  totalDays: z.number().int().min(1).optional(),
  manualDays: z
    .array(
      z.object({ title: z.string().optional(), chapters: z.array(z.string()) }),
    )
    .optional(),
});

export const Route = createFileRoute("/api/model/skills/$skillId/plan")({
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
        const parsed = planSchema.safeParse(body);
        if (!parsed.success) {
          return fail(
            { message: "Invalid plan preferences." },
            { status: 422 },
          );
        }
        try {
          const plan = await buildStudyPlan(skill, {
            timeline: parsed.data.timeline,
            startDate: parsed.data.startDate,
            hoursPerDay: parsed.data.hoursPerDay,
            daysPerWeek: parsed.data.daysPerWeek,
            totalDays: parsed.data.totalDays,
            manualDays: parsed.data.manualDays,
          });
          return ok({ plan }, { status: 201 });
        } catch (error) {
          return modelError(error);
        }
      },
      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
