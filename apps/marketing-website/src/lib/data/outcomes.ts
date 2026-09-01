import type { IconName } from "@lurniva/ui";

export interface Outcome {
  icon: IconName;
  title: string;
  description: string;
}

export const outcomes: Outcome[] = [
  {
    icon: "message-circle",
    title: "Understand faster",
    description:
      "Concepts are explained from your own material, in your own words, until they actually click.",
  },
  {
    icon: "layers",
    title: "Retain longer",
    description:
      "Flashcards and quizzes generated from what you studied turn a one-time read into memory that lasts.",
  },
  {
    icon: "calendar-check",
    title: "Revise smarter",
    description:
      "A plan built around your weak topics and the time you actually have — not a generic checklist.",
  },
  {
    icon: "target",
    title: "Walk into exams ready",
    description:
      "Practice against past-paper style questions, with mastery tracked chapter by chapter as you go.",
  },
];
