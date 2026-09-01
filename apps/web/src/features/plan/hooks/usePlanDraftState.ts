import type {
  AssignDaysDraft,
  BasicInfoDraft,
  ContentSelectionDraft,
  CreatePlanDraft,
  SchedulePeriodDraft,
} from "../create-plan-types";
import { sanitizeCreatePlanDraft } from "../create-plan-types";
import { useSessionStorageState } from "~/shared/hooks/useSessionStorageState";

export interface PlanDraftStateResult {
  draft: CreatePlanDraft;
  setBasicInfo: (basicInfo: Partial<BasicInfoDraft>) => void;
  setContent: (content: ContentSelectionDraft) => void;
  setSchedule: (schedule: Partial<SchedulePeriodDraft>) => void;
  setAssignment: (assignment: AssignDaysDraft) => void;
  resetDraft: () => void;
}

/**
 * SessionStorage-backed draft state shared by the create and edit plan
 * flows. The raw value from sessionStorage is only *typed* as
 * CreatePlanDraft — it may actually be stale/partial (an older schema, or
 * corrupted by a race between tabs). Every read and write goes through
 * sanitizeCreatePlanDraft so a malformed draft can never crash a render,
 * and the very next write self-heals what's persisted.
 */
export function usePlanDraftState(
  storageKey: string,
  defaultDraft: CreatePlanDraft,
): PlanDraftStateResult {
  const [rawDraft, setRawDraft] = useSessionStorageState<CreatePlanDraft>(
    storageKey,
    defaultDraft,
  );
  const draft = sanitizeCreatePlanDraft(rawDraft);

  const setBasicInfo = (basicInfo: Partial<BasicInfoDraft>) =>
    setRawDraft((previous) => {
      const safe = sanitizeCreatePlanDraft(previous);
      return { ...safe, basicInfo: { ...safe.basicInfo, ...basicInfo } };
    });

  const setContent = (content: ContentSelectionDraft) =>
    setRawDraft((previous) => ({ ...sanitizeCreatePlanDraft(previous), content }));

  const setSchedule = (schedule: Partial<SchedulePeriodDraft>) =>
    setRawDraft((previous) => {
      const safe = sanitizeCreatePlanDraft(previous);
      return { ...safe, schedule: { ...safe.schedule, ...schedule } };
    });

  const setAssignment = (assignment: AssignDaysDraft) =>
    setRawDraft((previous) => ({ ...sanitizeCreatePlanDraft(previous), assignment }));

  const resetDraft = () => setRawDraft(defaultDraft);

  return { draft, setBasicInfo, setContent, setSchedule, setAssignment, resetDraft };
}
