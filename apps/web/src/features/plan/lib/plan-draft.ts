import type { CreatePlanDraft } from "../create-plan-types";
import { sanitizeCreatePlanDraft } from "../create-plan-types";
import type { Plan } from "../types";

export function getEditPlanDraftStorageKey(planId: string): string {
  return `lurniva-edit-plan-draft-v1:${planId}`;
}

/**
 * Seeds the edit wizard's draft from an existing plan. Plans saved via the
 * wizard carry a full `draft` snapshot (ids and all) and rehydrate exactly.
 * Older/mock plans never had one — those only have display labels, not the
 * subject/topic/subtopic ids the content and assign-days steps need, so they
 * fall back to seeding just the basics and start steps 2 and 4 empty.
 */
export function buildDraftFromPlan(plan: Plan): CreatePlanDraft {
  if (plan.draft) return sanitizeCreatePlanDraft(plan.draft);

  return {
    basicInfo: { name: plan.name, dailyStudyHours: plan.studyHoursPerDay ?? null },
    content: { selectedSubtopicIdsByTopicId: {}, libraryItemIds: [] },
    schedule: { startDate: plan.startDate, endDate: plan.endDate },
    assignment: { assignments: [], restDayIndexes: [] },
  };
}
