import { useEffect, useState } from "react";
import { authFetch } from "~/shared/lib/api-client";
import type { Plan, PlanFormValues, PlansListStatus } from "../types";

interface PlansListResponse {
  plans: Plan[];
  totalCount: number;
  totalPages: number;
  page: number;
}

const EMPTY_RESPONSE: PlansListResponse = {
  plans: [],
  totalCount: 0,
  totalPages: 1,
  page: 1,
};

interface LoadedState {
  page: number;
  reloadToken: number;
  /** null means the fetch for this (page, reloadToken) pair failed. */
  data: PlansListResponse | null;
}

export interface UsePlansListResult {
  plans: Plan[];
  totalCount: number;
  status: PlansListStatus;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  refetch: () => void;
  deletePlan: (id: string) => void;
  updatePlan: (id: string, values: PlanFormValues) => void;
}

export function usePlansList(): UsePlansListResult {
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [loaded, setLoaded] = useState<LoadedState | null>(null);

  useEffect(() => {
    let cancelled = false;
    authFetch<PlansListResponse>(`/api/plans?page=${page}`)
      .then((result) => {
        if (cancelled) return;
        setLoaded({ page, reloadToken, data: result.success ? result.data : null });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ page, reloadToken, data: null });
      });
    return () => {
      cancelled = true;
    };
  }, [page, reloadToken]);

  // Only trust `loaded` once it matches the params that are currently
  // "live" — otherwise it's a stale response from a previous page/reload,
  // and the current request is still in flight (derived "loading" state,
  // rather than resetting a status flag synchronously inside the effect).
  const isCurrent = loaded?.page === page && loaded.reloadToken === reloadToken;
  const data = isCurrent ? loaded.data : undefined;
  const resolvedData = data ?? EMPTY_RESPONSE;

  const status: PlansListStatus =
    data === undefined
      ? "loading"
      : data === null
        ? "error"
        : data.plans.length === 0
          ? "empty"
          : "ready";

  function reload() {
    setReloadToken((token) => token + 1);
  }

  function deletePlan(id: string) {
    void authFetch(`/api/plans/${id}`, { method: "DELETE" }).then((result) => {
      if (result.success) reload();
    });
  }

  function updatePlan(id: string, values: PlanFormValues) {
    void authFetch(`/api/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(values),
    }).then((result) => {
      if (result.success) reload();
    });
  }

  return {
    plans: resolvedData.plans,
    totalCount: resolvedData.totalCount,
    status,
    page: resolvedData.page,
    totalPages: resolvedData.totalPages,
    setPage,
    refetch: reload,
    deletePlan,
    updatePlan,
  };
}
