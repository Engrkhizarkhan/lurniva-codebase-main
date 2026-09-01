import { createContext, useMemo } from "react";
import type { ReactNode } from "react";
import type { PlanDraftStateResult } from "../hooks/usePlanDraftState";
import { usePlanDraftState } from "../hooks/usePlanDraftState";
import {
  buildDraftFromPlan,
  getEditPlanDraftStorageKey,
} from "../lib/plan-draft";
import type { Plan } from "../types";

export type EditPlanContextValue = PlanDraftStateResult;

export const EditPlanContext = createContext<EditPlanContextValue | null>(null);

interface EditPlanProviderProps {
  planId: string;
  initialPlan: Plan;
  children: ReactNode;
}

export function EditPlanProvider({
  planId,
  initialPlan,
  children,
}: EditPlanProviderProps) {
  const initialDraft = useMemo(
    () => buildDraftFromPlan(initialPlan),
    [initialPlan],
  );
  const state = usePlanDraftState(
    getEditPlanDraftStorageKey(planId),
    initialDraft,
  );

  return (
    <EditPlanContext.Provider value={state}>
      {children}
    </EditPlanContext.Provider>
  );
}
