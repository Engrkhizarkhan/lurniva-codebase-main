import type { IconName } from "@lurniva/ui";

export interface InstituteFlowStep {
  title: string;
  detail: string;
  icon: IconName;
  iconBg: string;
  iconFg: string;
}

export const instituteFlow: InstituteFlowStep[] = [
  { title: "Institution content", detail: "612 files · syllabi, notes, papers", icon: "library", iconBg: "bg-forest-050", iconFg: "text-forest-700" },
  { title: "Lurniva AI", detail: "Indexes every chapter and example", icon: "sparkles", iconBg: "bg-lime-100", iconFg: "text-forest-800" },
  { title: "Students", detail: "Cohorts, sections, assigned courses", icon: "users-round", iconBg: "bg-ember-050", iconFg: "text-ember-600" },
  { title: "AI learning experience", detail: "Companion, plan, practice", icon: "graduation-cap", iconBg: "bg-forest-050", iconFg: "text-forest-700" },
  { title: "Assessment", detail: "Papers and grading from your material", icon: "clipboard-check", iconBg: "bg-teal-100", iconFg: "text-teal-600" },
  { title: "Analytics", detail: "Mastery by concept, cohort and campus", icon: "bar-chart-3", iconBg: "bg-amber-100", iconFg: "text-amber-600" },
];

export const weakestConcepts = [
  { label: "Trigonometric identities · Grade 12", percent: 31, tone: "var(--clay-500)", statusClass: "text-clay-600" },
  { label: "Wave interference · Grade 10", percent: 44, tone: "var(--amber-500)", statusClass: "text-amber-600" },
  { label: "Enzyme kinetics · Grade 11", percent: 72, tone: "var(--forest-500)", statusClass: "text-forest-600" },
];

export const instituteStats = [
  { value: "1,240", label: "Students", tone: "var(--forest-500)" },
  { value: "612", label: "Files indexed", tone: "var(--lime-500)" },
  { value: "68%", label: "Avg. mastery", tone: "var(--ember-500)" },
  { value: "38", label: "Teachers", tone: "var(--amber-500)" },
];
