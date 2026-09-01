import { z } from "zod";

export interface CurriculumOption {
  id: "pakistani" | "cambridge";
  label: string;
  subtitle: string;
  icon: "moon" | "flag";
  tone: "primary" | "teacher";
}

export const curriculumOptions: CurriculumOption[] = [
  {
    id: "pakistani",
    label: "Pakistani Curriculum",
    subtitle: "SNC / Federal Board",
    icon: "moon",
    tone: "primary",
  },
  {
    id: "cambridge",
    label: "Cambridge International",
    subtitle: "O-Level / AS & A-Level",
    icon: "flag",
    tone: "teacher",
  },
];

const curriculumIds = curriculumOptions.map((option) => option.id) as [
  CurriculumOption["id"],
  ...CurriculumOption["id"][],
];

export const onboardingProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").max(120),
  curriculum: z.enum(curriculumIds, "Choose your curriculum"),
});
export type OnboardingProfileInput = z.infer<typeof onboardingProfileSchema>;
