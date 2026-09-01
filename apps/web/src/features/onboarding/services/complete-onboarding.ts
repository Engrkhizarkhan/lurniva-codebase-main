import { prisma } from "@lurniva/db";
import type { CompleteOnboardingInput } from "../validation/index.js";

export async function completeOnboarding(
  userId: string,
  input: CompleteOnboardingInput,
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: input.fullName,
      curriculum: input.curriculum,
      grade: input.grade,
      schoolName: input.schoolName,
      isOnboarded: true,
    },
  });
}
