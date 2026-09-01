import { prisma } from "@lurniva/db";
import type { AiAssessmentAttempt } from "@lurniva/db";
import { getAiProvider } from "~/server/ai";
import {
  generateAssessmentForSession,
  type AnswerKeyMetadata,
} from "~/server/ai/assessment-engine";
import { findOwnedPlanId } from "../../plan/services/plan-ownership";
import type { AssessmentCounts } from "../lib/assessment-plan";
import { resolveAssessmentCounts } from "../lib/assessment-plan";
import type {
  AssessmentFeature,
  CompleteAttemptResponse,
  GenerateAssessmentResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "../types";
import { getOrCreateAiSession } from "./ai-session";
import { buildGroundedDayContext, findPlanDay } from "./plan-day-lookup";

export class AttemptNotFoundError extends Error {
  constructor() {
    super("Assessment attempt not found");
  }
}

/**
 * Generates an assessment for one plan day. Question counts are optional —
 * omitted, each type falls back to its default size — and are clamped by
 * `resolveAssessmentCounts` before anything is generated.
 */
export async function generateAssessment(
  userId: string,
  planId: string,
  dayNumber: number,
  feature: AssessmentFeature,
  counts?: Partial<AssessmentCounts>,
  model?: string,
): Promise<GenerateAssessmentResponse> {
  const planDbId = await findOwnedPlanId(userId, planId);
  const day = await findPlanDay(planDbId, dayNumber);
  const session = await getOrCreateAiSession(userId, day.id, "assessment", feature);
  const context = await buildGroundedDayContext(userId, day, feature);

  return generateAssessmentForSession({
    sessionId: session.id,
    context,
    feature,
    counts: resolveAssessmentCounts(feature, counts),
    model,
  });
}

export async function submitAssessmentAnswer(
  userId: string,
  attemptId: string,
  input: SubmitAnswerRequest,
): Promise<SubmitAnswerResponse> {
  const attempt = await findOwnedAttempt(userId, attemptId);
  const metadata = attempt.metadata as unknown as AnswerKeyMetadata;
  const key = metadata.answerKey[input.questionId];

  let isCorrect: boolean | null = null;
  let feedback: string | null = null;
  let correctAnswer: string | null = null;

  if (input.kind === "mcq" && key) {
    isCorrect = input.selectedOptionIdx === key.correctOptionIdx;
    feedback = key.explanation ?? null;
    correctAnswer = key.correctOptionIdx !== undefined ? String(key.correctOptionIdx) : null;
  } else if (input.kind === "short" && key) {
    const graded = await getAiProvider().gradeShortAnswer({
      prompt: key.prompt,
      modelAnswer: key.modelAnswer ?? "",
      responseText: input.responseText ?? "",
    });
    isCorrect = graded.isCorrect;
    feedback = graded.feedback;
    correctAnswer = key.modelAnswer ?? null;
  } else if (input.kind === "flashcard") {
    isCorrect = input.flashcardResult === "known";
  }

  await prisma.aiAssessmentAnswer.create({
    data: {
      attemptId: attempt.id,
      questionId: input.questionId,
      selectedOptionIdx: input.selectedOptionIdx ?? null,
      isCorrect,
      responseText: input.responseText ?? input.flashcardResult ?? null,
    },
  });

  return { isCorrect, feedback, correctAnswer };
}

export async function completeAssessmentAttempt(
  userId: string,
  attemptId: string,
): Promise<CompleteAttemptResponse> {
  const attempt = await findOwnedAttempt(userId, attemptId);
  const answers = await prisma.aiAssessmentAnswer.findMany({ where: { attemptId: attempt.id } });
  const gradable = answers.filter((answer) => answer.isCorrect !== null);
  const correctCount = gradable.filter((answer) => answer.isCorrect).length;
  const score = gradable.length > 0 ? Math.round((correctCount / gradable.length) * 100) : null;

  await prisma.aiAssessmentAttempt.update({
    where: { id: attempt.id },
    data: { completedAt: new Date(), score: score ?? undefined },
  });

  return { score, totalQuestions: answers.length, correctCount };
}

async function findOwnedAttempt(
  userId: string,
  attemptId: string,
): Promise<AiAssessmentAttempt> {
  let id: bigint;
  try {
    id = BigInt(attemptId);
  } catch {
    throw new AttemptNotFoundError();
  }

  const attempt = await prisma.aiAssessmentAttempt.findFirst({
    where: { id, session: { userId } },
  });
  if (!attempt) throw new AttemptNotFoundError();
  return attempt;
}
