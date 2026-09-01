import { z } from "zod";

export interface GradeOption {
  value: "9" | "10" | "11" | "12";
  label: string;
}

export const gradeOptions: GradeOption[] = [
  { value: "9", label: "Grade 9" },
  { value: "10", label: "Grade 10" },
  { value: "11", label: "O-Level" },
  { value: "12", label: "A-Level" },
];

const gradeValues = gradeOptions.map((option) => option.value) as [
  GradeOption["value"],
  ...GradeOption["value"][],
];

export const onboardingAcademicSchema = z.object({
  grade: z.enum(gradeValues, "Select your grade"),
  schoolName: z.string().max(160).optional(),
});
export type OnboardingAcademicInput = z.infer<typeof onboardingAcademicSchema>;
