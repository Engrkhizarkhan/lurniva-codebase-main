import { createContext } from "react";
import type { ReactNode } from "react";
import {
  CREATE_PLAN_DRAFT_STORAGE_KEY,
  DEFAULT_CREATE_PLAN_DRAFT,
} from "../create-plan-types";
import type { PlanDraftStateResult } from "../hooks/usePlanDraftState";
import { usePlanDraftState } from "../hooks/usePlanDraftState";

export type CreatePlanContextValue = PlanDraftStateResult;

export const CreatePlanContext = createContext<CreatePlanContextValue | null>(
  null,
);

export function CreatePlanProvider({ children }: { children: ReactNode }) {
  const state = usePlanDraftState(CREATE_PLAN_DRAFT_STORAGE_KEY, DEFAULT_CREATE_PLAN_DRAFT);

  return (
    <CreatePlanContext.Provider value={state}>
      {children}
    </CreatePlanContext.Provider>
  );
}
