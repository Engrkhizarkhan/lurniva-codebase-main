import { useMutation } from "@tanstack/react-query";
import { authFetchStream } from "../lib/stream-fetch";
import { useDayStudyStore } from "../store/day-study-store";
import type { LearningFeature } from "../types";

export function useAiGenerate(planId: string, dayNumber: number) {
  const startLearningStream = useDayStudyStore((state) => state.startLearningStream);
  const appendLearningStreamChunk = useDayStudyStore((state) => state.appendLearningStreamChunk);
  const finishLearningStream = useDayStudyStore((state) => state.finishLearningStream);
  const failLearningStream = useDayStudyStore((state) => state.failLearningStream);

  const mutation = useMutation({
    mutationFn: async (feature: LearningFeature) => {
      startLearningStream(feature);
      try {
        for await (const chunk of authFetchStream(`/api/ai/learning/${planId}/${dayNumber}`, {
          method: "POST",
          body: JSON.stringify({ feature }),
        })) {
          appendLearningStreamChunk(chunk);
        }
        finishLearningStream();
      } catch (error) {
        failLearningStream(feature);
        throw error;
      }
    },
  });

  return {
    generate: mutation.mutate,
    isGenerating: mutation.isPending,
    error: mutation.error,
  };
}
