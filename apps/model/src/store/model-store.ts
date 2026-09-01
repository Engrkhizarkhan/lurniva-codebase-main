import type {
  SkillDoc,
  LearningPlan,
  GeneratedAssessment,
} from "../features/model/types";

/**
 * In-memory model store (server-side). Data lives for the life of the process —
 * enough for the demo + dev flows. Swap these thin functions for Supabase /
 * Prisma calls to persist across restarts.
 */

const skills = new Map<string, SkillDoc>();
const plans = new Map<string, LearningPlan>();
const assessments = new Map<string, GeneratedAssessment>();

export const skillStore = {
  list(): SkillDoc[] {
    return [...skills.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },
  get(id: string): SkillDoc | undefined {
    return skills.get(id);
  },
  save(skill: SkillDoc): void {
    skills.set(skill.id, skill);
  },
  remove(id: string): void {
    skills.delete(id);
  },
};

export const planStore = {
  list(): LearningPlan[] {
    return [...plans.values()];
  },
  get(id: string): LearningPlan | undefined {
    return plans.get(id);
  },
  save(plan: LearningPlan): void {
    plans.set(plan.id, plan);
  },
};

export const assessmentStore = {
  list(): GeneratedAssessment[] {
    return [...assessments.values()];
  },
  get(id: string): GeneratedAssessment | undefined {
    return assessments.get(id);
  },
  save(assessment: GeneratedAssessment): void {
    assessments.set(assessment.id, assessment);
  },
};
