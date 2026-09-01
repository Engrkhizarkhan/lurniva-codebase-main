import { prisma } from "@lurniva/db";
import type { Prisma } from "@lurniva/db";
import { generateAssessmentForSession } from "~/server/ai/assessment-engine";
import type { AssessmentCounts } from "../../day-study/lib/assessment-plan";
import { resolveAssessmentCounts } from "../../day-study/lib/assessment-plan";
import type {
  AssessmentFeature,
  GenerateAssessmentResponse,
} from "../../day-study/types";
import {
  findOwnedAiStudySession,
  readSessionConfig,
} from "./ai-study-sessions";
import { resolveStudyContext } from "./study-context";

/**
 * Generates an assessment for an AI Study session. Grading and completion are
 * not re-implemented here: attempts are keyed by id, so the session's answers
 * flow through the same `submitAssessmentAnswer` /
 * `completeAssessmentAttempt` the day-study page uses.
 */
export async function generateAiStudyAssessment(
  userId: string,
  sessionId: string,
  feature: AssessmentFeature,
  counts: Partial<AssessmentCounts> | undefined,
  model?: string,
): Promise<GenerateAssessmentResponse> {
  const session = await findOwnedAiStudySession(userId, sessionId);
  const config = readSessionConfig(session);
  const { topic } = await resolveStudyContext(userId, config.context, feature);
  const resolvedCounts = resolveAssessmentCounts(feature, counts);

  const result = await generateAssessmentForSession({
    sessionId: session.id,
    context: topic,
    feature,
    counts: resolvedCounts,
    model,
  });

  // Remember the setup so reopening the session offers what was last run.
  await prisma.aiSession.update({
    where: { id: session.id },
    data: {
      metadata: {
        ...config,
        studyMode: "assessment",
        assessmentFeature: feature,
        assessmentCounts: resolvedCounts,
      } as unknown as Prisma.InputJsonValue,
    },
  });

  return result;
}
