import { useQuery } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import type { StudySources } from "../types";

/** Catalog subjects, ready library material and plan days for the topic picker. */
export function useStudySources() {
  return useQuery({
    queryKey: ["ai-study", "sources"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const result = await authFetch<StudySources>("/api/ai/study-sources");
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });
}
