import { z } from "zod";

export const modelFieldSchema = z.string().trim().max(64).optional();

export const responseStyleSchema = z.enum([
  "summary",
  "revision_notes",
  "detailed_guide",
  "last_minute_notes",
]);

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4000, "Message is too long"),
  model: modelFieldSchema,
});
export type ChatMessageInput = z.infer<typeof chatMessageSchema>;

export const learningFeatureSchema = z.enum(["summarize", "revision_notes", "last_minute_notes"]);
export type LearningFeatureInput = z.infer<typeof learningFeatureSchema>;
export const generateLearningSchema = z.object({
  feature: learningFeatureSchema,
  model: modelFieldSchema,
});
export type GenerateLearningInput = z.infer<typeof generateLearningSchema>;

export const assessmentFeatureSchema = z.enum([
  "flashcards",
  "mcqs",
  "short_questions",
  "mock_exam",
]);
/** Optional per-kind sizing; omitted fields fall back to each type's default. */
export const assessmentCountsSchema = z.object({
  mcqs: z.number().int().min(1).max(50).optional(),
  shortQuestions: z.number().int().min(1).max(30).optional(),
  flashcards: z.number().int().min(1).max(100).optional(),
});

export const generateAssessmentSchema = z.object({
  feature: assessmentFeatureSchema,
  counts: assessmentCountsSchema.optional(),
  model: modelFieldSchema,
});
export type GenerateAssessmentInput = z.infer<typeof generateAssessmentSchema>;

export const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  kind: z.enum(["mcq", "short", "flashcard"]),
  selectedOptionIdx: z.number().int().min(0).optional(),
  responseText: z.string().max(4000).optional(),
  flashcardResult: z.enum(["known", "review"]).optional(),
});
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
