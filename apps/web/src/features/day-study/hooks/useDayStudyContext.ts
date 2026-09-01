import { useQuery } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import type { DayStudyContext } from "../types";

export function useDayStudyContext(planId: string, dayNumber: number) {
  return useQuery({
    queryKey: ["day-study", "context", planId, dayNumber],
    queryFn: async () => {
      const result = await authFetch<DayStudyContext>(
        `/api/ai/context/${planId}/${dayNumber}`,
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}
