import type { AssessmentFeature } from "../types";

/**
 * How an assessment is sized. Shared by the client (config UI, duration
 * estimates, the CTA label) and the server (validation + generation), so the
 * "20 questions · ~15 min" the student agrees to is the one that gets built.
 */
export interface AssessmentCounts {
  mcqs: number;
  shortQuestions: number;
  flashcards: number;
}

export type AssessmentCountKey = keyof AssessmentCounts;

interface CountBounds {
  min: number;
  max: number;
  /** Minutes a student is expected to spend on one item of this kind. */
  minutesEach: number;
}

export const ASSESSMENT_BOUNDS: Record<AssessmentCountKey, CountBounds> = {
  mcqs: { min: 1, max: 50, minutesEach: 0.75 },
  shortQuestions: { min: 1, max: 30, minutesEach: 2.5 },
  flashcards: { min: 1, max: 100, minutesEach: 0.4 },
};

/** Presets the config UI offers per assessment type, alongside a custom value. */
export const ASSESSMENT_PRESETS: Record<AssessmentFeature, number[]> = {
  mcqs: [5, 10, 20, 30],
  flashcards: [10, 20, 30, 50],
  short_questions: [5, 10, 15, 20],
  mock_exam: [],
};

export const DEFAULT_ASSESSMENT_COUNTS: Record<AssessmentFeature, AssessmentCounts> = {
  mcqs: { mcqs: 10, shortQuestions: 0, flashcards: 0 },
  flashcards: { mcqs: 0, shortQuestions: 0, flashcards: 20 },
  short_questions: { mcqs: 0, shortQuestions: 10, flashcards: 0 },
  mock_exam: { mcqs: 10, shortQuestions: 5, flashcards: 10 },
};

/** Which count fields a given assessment type actually uses. */
export function activeCountKeys(feature: AssessmentFeature): AssessmentCountKey[] {
  switch (feature) {
    case "mcqs":
      return ["mcqs"];
    case "flashcards":
      return ["flashcards"];
    case "short_questions":
      return ["shortQuestions"];
    default:
      return ["mcqs", "shortQuestions", "flashcards"];
  }
}

export function clampCount(key: AssessmentCountKey, value: number): number {
  const { min, max } = ASSESSMENT_BOUNDS[key];
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Normalises a partial, user-supplied config into the counts to generate:
 * fields the chosen type doesn't use are zeroed, the rest are clamped.
 */
export function resolveAssessmentCounts(
  feature: AssessmentFeature,
  requested?: Partial<AssessmentCounts>,
): AssessmentCounts {
  const defaults = DEFAULT_ASSESSMENT_COUNTS[feature];
  const keys = activeCountKeys(feature);
  const counts: AssessmentCounts = { mcqs: 0, shortQuestions: 0, flashcards: 0 };
  for (const key of keys) {
    const value = requested?.[key];
    counts[key] = clampCount(key, value ?? defaults[key]);
  }
  return counts;
}

/**
 * The subset of a full `AssessmentCounts` a feature actually uses — what the
 * server accepts. The config UI always keeps a complete `AssessmentCounts`
 * around (so an inactive stepper still has a sane default if the student
 * switches back to it), but sending the zeroed-out fields for the other kinds
 * fails validation: they are neither an allowed key for the feature nor a
 * count above its minimum.
 */
export function pickActiveCounts(
  feature: AssessmentFeature,
  counts: AssessmentCounts,
): Partial<AssessmentCounts> {
  const active: Partial<AssessmentCounts> = {};
  for (const key of activeCountKeys(feature)) {
    active[key] = counts[key];
  }
  return active;
}

export function totalQuestions(counts: AssessmentCounts): number {
  return counts.mcqs + counts.shortQuestions + counts.flashcards;
}

/** Rounded-up minutes, never below one — used for the "~15 min" affordance. */
export function estimateMinutes(counts: AssessmentCounts): number {
  const minutes =
    counts.mcqs * ASSESSMENT_BOUNDS.mcqs.minutesEach +
    counts.shortQuestions * ASSESSMENT_BOUNDS.shortQuestions.minutesEach +
    counts.flashcards * ASSESSMENT_BOUNDS.flashcards.minutesEach;
  return Math.max(1, Math.ceil(minutes));
}
