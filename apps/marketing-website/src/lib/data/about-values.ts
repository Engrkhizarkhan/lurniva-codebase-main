import type { IconName } from "@lurniva/ui";

export interface AboutValue {
  icon: IconName;
  title: string;
  description: string;
}

export const aboutValues: AboutValue[] = [
  { icon: "accessibility", title: "Make learning reachable", description: "Free tier in every seat, works on a phone." },
  { icon: "presentation", title: "Help teachers teach", description: "Automate marking, not judgement." },
  { icon: "library", title: "Make content useful", description: "A PDF becomes a course, not a download." },
  { icon: "trending-up", title: "Show real progress", description: "Mastery and gaps, never vague praise." },
];
