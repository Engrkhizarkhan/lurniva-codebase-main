import type { IconName } from "@lurniva/ui";

export interface OrgFeature {
  title: string;
  description: string;
  icon: IconName;
  iconBg: string;
  iconFg: string;
  status: string;
  statusClass: string;
}

export const orgFeatures: OrgFeature[] = [
  {
    title: "Knowledge management",
    description: "Index the documents people keep asking about.",
    icon: "folder-open",
    iconBg: "bg-forest-050",
    iconFg: "text-forest-700",
    status: "Available now",
    statusClass: "text-forest-600",
  },
  {
    title: "AI-powered training",
    description: "Programmes and practice generated from your own material.",
    icon: "sparkles",
    iconBg: "bg-lime-100",
    iconFg: "text-forest-800",
    status: "Available now",
    statusClass: "text-forest-600",
  },
  {
    title: "Onboarding paths",
    description: "Role-based first-90-days tracks with sign-off.",
    icon: "user-check",
    iconBg: "bg-amber-100",
    iconFg: "text-amber-600",
    status: "In development",
    statusClass: "text-amber-600",
  },
];

export const orgRoadmap = [
  "SSO — coming soon",
  "Compliance reporting — coming soon",
  "Skills mapping — coming soon",
];
