import type { IconName } from "@lurniva/ui";

export interface InstituteCapability {
  title: string;
  description: string;
  icon: IconName;
  iconBg: string;
  iconFg: string;
}

export const instituteCapabilities: InstituteCapability[] = [
  {
    title: "Student & teacher management",
    description: "Cohorts, sections and roles — assign content and track progress by class.",
    icon: "users-round",
    iconBg: "bg-forest-050",
    iconFg: "text-forest-700",
  },
  {
    title: "Multi-campus governance",
    description: "One content library and one set of policies across every campus.",
    icon: "building-2",
    iconBg: "bg-teal-100",
    iconFg: "text-teal-600",
  },
  {
    title: "Assessment & AI grading",
    description: "Papers and grading generated from your own syllabus — the AI Examiner, at institute scale.",
    icon: "clipboard-check",
    iconBg: "bg-amber-100",
    iconFg: "text-amber-600",
  },
  {
    title: "Partnerships & onboarding",
    description: "A dedicated team helps index your content and set up your first term.",
    icon: "user-check",
    iconBg: "bg-ember-050",
    iconFg: "text-ember-600",
  },
];
