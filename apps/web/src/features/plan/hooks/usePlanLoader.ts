import { useEffect, useState } from "react";
import { authFetch } from "~/shared/lib/api-client";
import type { Plan } from "../types";

export type PlanLoaderStatus = "loading" | "not-found" | "error" | "ready";

interface LoadedState {
  planId: string;
  attempt: number;
  status: PlanLoaderStatus;
  plan: Plan | null;
}

export interface UsePlanLoaderResult {
  plan: Plan | null;
  status: PlanLoaderStatus;
  refetch: () => void;
}

/** Fetches a single plan by id — shared by the edit flow and the plan-detail page. */
export function usePlanLoader(planId: string): UsePlanLoaderResult {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<LoadedState | null>(null);

  useEffect(() => {
    let cancelled = false;
    authFetch<Plan>(`/api/plans/${planId}`)
      .then((result) => {
        if (cancelled) return;
        if (result.success) {
          setLoaded({ planId, attempt, status: "ready", plan: result.data });
        } else if (result.error.code === "NOT_FOUND") {
          setLoaded({ planId, attempt, status: "not-found", plan: null });
        } else {
          setLoaded({ planId, attempt, status: "error", plan: null });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoaded({ planId, attempt, status: "error", plan: null });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [planId, attempt]);

  // Derived rather than reset synchronously in the effect: while a fetch for
  // the current (planId, attempt) is in flight, `loaded` still holds the
  // previous one and is ignored.
  const isCurrent = loaded?.planId === planId && loaded.attempt === attempt;

  return {
    plan: isCurrent ? loaded.plan : null,
    status: isCurrent ? loaded.status : "loading",
    refetch: () => setAttempt((count) => count + 1),
  };
}
