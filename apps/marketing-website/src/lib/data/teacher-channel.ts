import type { IconName } from "@lurniva/ui";

export interface TeacherChannelFeature {
  title: string;
  description: string;
  icon: IconName;
  iconBg: string;
  iconFg: string;
}

export const teacherChannelFeatures: TeacherChannelFeature[] = [
  {
    title: "Your own channel page",
    description: "A branded page under your name with every course you publish.",
    icon: "badge-check",
    iconBg: "bg-teal-100",
    iconFg: "text-teal-600",
  },
  {
    title: "Students follow you",
    description: "New lessons and updates reach everyone who subscribes.",
    icon: "users",
    iconBg: "bg-ember-050",
    iconFg: "text-ember-600",
  },
  {
    title: "Announcements",
    description: "Message your whole cohort about a new upload or a paper.",
    icon: "radio",
    iconBg: "bg-forest-050",
    iconFg: "text-forest-700",
  },
  {
    title: "Community Q&A",
    description: "Students ask questions on a lesson and other learners can help.",
    icon: "message-circle",
    iconBg: "bg-amber-100",
    iconFg: "text-amber-600",
  },
];
