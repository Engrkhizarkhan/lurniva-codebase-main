import { useMutation } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import type { AssessmentCounts } from "../lib/assessment-plan";
import type {
  AssessmentFeature,
  CompleteAttemptResponse,
  GenerateAssessmentResponse,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
} from "../types";

export interface GenerateAssessmentInput {
  feature: AssessmentFeature;
  counts?: Partial<AssessmentCounts>;
}

export function useGenerateAssessment(planId: string, dayNumber: number) {
  return useMutation<GenerateAssessmentResponse, Error, GenerateAssessmentInput>({
    mutationFn: async ({ feature, counts }) => {
      const result = await authFetch<GenerateAssessmentResponse>(
        `/api/ai/assessment/${planId}/${dayNumber}`,
        { method: "POST", body: JSON.stringify({ feature, counts }) },
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}

export function useSubmitAssessmentAnswer(attemptId: string) {
  return useMutation({
    mutationFn: async (input: SubmitAnswerRequest) => {
      const result = await authFetch<SubmitAnswerResponse>(
        `/api/ai/assessment/answer/${attemptId}`,
        { method: "POST", body: JSON.stringify(input) },
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}

export function useCompleteAssessmentAttempt(attemptId: string) {
  return useMutation({
    mutationFn: async () => {
      const result = await authFetch<CompleteAttemptResponse>(
        `/api/ai/assessment/complete/${attemptId}`,
        { method: "POST" },
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}
