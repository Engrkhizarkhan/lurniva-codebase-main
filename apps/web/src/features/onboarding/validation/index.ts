import { onboardingAcademicSchema } from "./academic.js";
import { onboardingProfileSchema } from "./profile.js";
import type { z } from "zod";

export * from "./profile.js";
export * from "./academic.js";

export const completeOnboardingSchema = onboardingProfileSchema.merge(
  onboardingAcademicSchema,
);
export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
