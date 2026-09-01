import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fail, modelError, ok } from "~/lib/response";
import { generateAssessment } from "~/features/model/services/assessments";
import { skillStore } from "~/store/model-store";

const assessSchema = z.object({
  kind: z.enum(["flashcards", "mcqs", "short_questions", "mock_exam"]),
  chapterIds: z.array(z.string()).default([]),
  count: z.number().int().min(1).max(20).optional(),
});

export const Route = createFileRoute("/api/model/skills/$skillId/assessments")({
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
        const parsed = assessSchema.safeParse(body);
        if (!parsed.success) {
          return fail(
            { message: "Invalid assessment preferences." },
            { status: 422 },
          );
        }
        try {
          const assessment = await generateAssessment(skill, {
            kind: parsed.data.kind,
            chapterIds: parsed.data.chapterIds,
            count: parsed.data.count,
          });
          const shielded = {
            ...assessment,
            questions: assessment.questions.map(
              ({ correctIndex: _correctIndex, ...rest }) => rest,
            ),
          };
          return ok({ assessment: shielded }, { status: 201 });
        } catch (error) {
          return modelError(error);
        }
      },
      OPTIONS: () => new Response(null, { status: 204 }),
    },
  },
});
