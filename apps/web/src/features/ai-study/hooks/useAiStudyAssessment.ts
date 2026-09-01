import { useMutation } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import type { AssessmentCounts } from "../../day-study/lib/assessment-plan";
import type {
  AssessmentFeature,
  GenerateAssessmentResponse,
} from "../../day-study/types";

/**
 * Generates an assessment for the open session. Submitting answers and
 * completing an attempt reuse `useSubmitAssessmentAnswer` /
 * `useCompleteAssessmentAttempt` from the day-study feature — attempts are
 * keyed by id, so there is no second grading path.
 */
export interface GenerateAssessmentInput {
  feature: AssessmentFeature;
  counts?: Partial<AssessmentCounts>;
}

export function useGenerateAiStudyAssessment(sessionId: string | null) {
  return useMutation<GenerateAssessmentResponse, Error, GenerateAssessmentInput>({
    mutationFn: async ({ feature, counts }) => {
      if (!sessionId) throw new Error("Start a session before running an assessment.");
      const result = await authFetch<GenerateAssessmentResponse>(
        `/api/ai/sessions/${sessionId}/assessment`,
        { method: "POST", body: JSON.stringify({ feature, counts }) },
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}
