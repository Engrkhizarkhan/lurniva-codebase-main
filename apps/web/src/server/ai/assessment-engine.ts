import { prisma } from "@lurniva/db";
import type { Prisma } from "@lurniva/db";
import type {
  AssessmentFeature,
  GenerateAssessmentResponse,
} from "~/features/day-study/types";
import type { AssessmentCounts } from "~/features/day-study/lib/assessment-plan";
import { estimateMinutes, totalQuestions } from "~/features/day-study/lib/assessment-plan";
import { getAiProvider } from "./index";
import type { DayTopicContext } from "./ai-provider";

/**
 * Generates one assessment attempt for an already-resolved AI session.
 *
 * This is the single place questions are produced and their answer key is
 * stored: the per-day study page and the standalone AI Study workspace both
 * come through here, so grading (`submitAssessmentAnswer`) has one contract to
 * read. Callers own resolving the session and the grounded topic context.
 */

interface AnswerKeyEntry {
  kind: "mcq" | "short";
  prompt: string;
  correctOptionIdx?: number;
  explanation?: string;
  modelAnswer?: string;
}

export type AnswerKeyMetadata = { answerKey: Record<string, AnswerKeyEntry> };

export interface GenerateAssessmentParams {
  sessionId: bigint;
  context: DayTopicContext;
  feature: AssessmentFeature;
  counts: AssessmentCounts;
  model?: string;
}

export async function generateAssessmentForSession(
  params: GenerateAssessmentParams,
): Promise<GenerateAssessmentResponse> {
  const { sessionId, context, feature, counts, model } = params;
  const provider = getAiProvider(model);

  const attempt = await prisma.aiAssessmentAttempt.create({
    data: { sessionId, metadata: { answerKey: {} } },
  });

  // A mock exam asks for all three kinds at once; the single-kind types leave
  // the other counts at zero, so one request shape covers every assessment.
  const [flashcards, mcqs, shortQuestions] = await Promise.all([
    counts.flashcards > 0
      ? provider.generateFlashcards({ ...context, count: counts.flashcards, model })
      : Promise.resolve([]),
    counts.mcqs > 0
      ? provider.generateMcqs({ ...context, count: counts.mcqs, model })
      : Promise.resolve([]),
    counts.shortQuestions > 0
      ? provider.generateShortQuestions({
          ...context,
          count: counts.shortQuestions,
          model,
        })
      : Promise.resolve([]),
  ]);

  const answerKey: Record<string, AnswerKeyEntry> = {
    ...Object.fromEntries(
      mcqs.map((entry) => [
        entry.question.id,
        {
          kind: "mcq" as const,
          prompt: entry.question.prompt,
          correctOptionIdx: entry.correctOptionIdx,
          explanation: entry.explanation,
        },
      ]),
    ),
    ...Object.fromEntries(
      shortQuestions.map((entry) => [
        entry.question.id,
        {
          kind: "short" as const,
          prompt: entry.question.prompt,
          modelAnswer: entry.modelAnswer,
        },
      ]),
    ),
  };

  const metadata: AnswerKeyMetadata = { answerKey };
  await prisma.aiAssessmentAttempt.update({
    where: { id: attempt.id },
    data: { metadata: metadata as unknown as Prisma.InputJsonValue },
  });

  return {
    attemptId: attempt.id.toString(),
    feature,
    counts,
    totalQuestions: totalQuestions(counts),
    durationMinutes: estimateMinutes(counts),
    ...(flashcards.length > 0 ? { flashcards } : {}),
    ...(mcqs.length > 0 ? { mcqs: mcqs.map((entry) => entry.question) } : {}),
    ...(shortQuestions.length > 0
      ? { shortQuestions: shortQuestions.map((entry) => entry.question) }
      : {}),
  };
}
