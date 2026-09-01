import { z } from "zod";
import {
  ASSESSMENT_BOUNDS,
  activeCountKeys,
} from "../../day-study/lib/assessment-plan";
import { assessmentFeatureSchema, modelFieldSchema } from "../../day-study/validation/ai";

/**
 * Request schemas for the AI Study routes. Kept beside the feature like the
 * day-study AI schemas, and imported by both the route handlers and the
 * client so a config the UI accepts is one the server accepts.
 */

export const responseStyleSchema = z.enum([
  "summary",
  "revision_notes",
  "detailed_guide",
  "last_minute_notes",
]);

/**
 * A session starts with no chosen style — the composer shows the placeholder
 * and the model uses its default shape — so `null` is a real, storable value
 * rather than a missing field.
 */
const nullableResponseStyleSchema = responseStyleSchema.nullable();

export const studyModeSchema = z.enum(["learning", "assessment"]);

export const studyContextSchema = z
  .object({
    kind: z.enum(["catalog", "library", "plan_day", "general"]),
    subjectId: z.string().trim().max(32).optional(),
    topicId: z.string().trim().max(32).optional(),
    subtopicId: z.string().trim().max(32).optional(),
    libraryItemId: z.string().trim().max(32).optional(),
    chapterId: z.string().trim().max(200).optional(),
    planId: z.string().trim().max(32).optional(),
    dayNumber: z.number().int().min(1).max(400).optional(),
  })
  .refine((value) => value.kind !== "catalog" || Boolean(value.topicId), {
    message: "Choose a topic to study",
    path: ["topicId"],
  })
  .refine((value) => value.kind !== "library" || Boolean(value.libraryItemId), {
    message: "Choose a library item to study",
    path: ["libraryItemId"],
  })
  .refine(
    (value) =>
      value.kind !== "plan_day" ||
      (Boolean(value.planId) && typeof value.dayNumber === "number"),
    { message: "Choose a plan day to study", path: ["planId"] },
  );

export const createAiStudySessionSchema = z.object({
  context: studyContextSchema,
  responseStyle: nullableResponseStyleSchema.default(null),
  studyMode: studyModeSchema.default("learning"),
  title: z.string().trim().max(60).optional(),
});
export type CreateAiStudySessionInput = z.infer<typeof createAiStudySessionSchema>;

export const updateAiStudySessionSchema = z
  .object({
    title: z.string().trim().min(1, "A session needs a name").max(60).optional(),
    responseStyle: nullableResponseStyleSchema.optional(),
    studyMode: studyModeSchema.optional(),
    context: studyContextSchema.optional(),
  })
  .refine((value) => Object.values(value).some((entry) => entry !== undefined), {
    message: "Nothing to update",
  });
export type UpdateAiStudySessionInput = z.infer<typeof updateAiStudySessionSchema>;

export const aiStudyRespondSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4000, "Message is too long"),
  mode: z.enum(["guided", "exploratory", "concise"]).optional(),
  responseStyle: responseStyleSchema.optional(),
  model: modelFieldSchema,
});
export type AiStudyRespondInput = z.infer<typeof aiStudyRespondSchema>;

const countField = (key: keyof typeof ASSESSMENT_BOUNDS) =>
  z
    .number()
    .int("Use a whole number")
    .min(ASSESSMENT_BOUNDS[key].min, `Use at least ${ASSESSMENT_BOUNDS[key].min}`)
    .max(ASSESSMENT_BOUNDS[key].max, `Use at most ${ASSESSMENT_BOUNDS[key].max}`)
    .optional();

/**
 * Counts are per question kind so a mock exam can size its three sections
 * independently. Only the fields the chosen type uses may be sent — a stray
 * `flashcards: 10` on an MCQ run is a client bug, not a silent no-op.
 */
export const assessmentConfigSchema = z
  .object({
    feature: assessmentFeatureSchema,
    counts: z
      .object({
        mcqs: countField("mcqs"),
        shortQuestions: countField("shortQuestions"),
        flashcards: countField("flashcards"),
      })
      .optional(),
    model: modelFieldSchema,
  })
  .superRefine((value, ctx) => {
    if (!value.counts) return;
    const allowed = new Set<string>(activeCountKeys(value.feature));
    for (const [key, count] of Object.entries(value.counts)) {
      if (count !== undefined && !allowed.has(key)) {
        ctx.addIssue({
          code: "custom",
          path: ["counts", key],
          message: `${value.feature} does not use ${key}`,
        });
      }
    }
  });
export type AssessmentConfigInput = z.infer<typeof assessmentConfigSchema>;
