import { useQuery } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import type { DashboardOverview } from "../services/dashboard-overview";

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const result = await authFetch<{ overview: DashboardOverview }>(
        "/api/dashboard/overview",
      );
      if (!result.success) throw new Error(result.error.message);
      return result.data.overview;
    },
  });
}
