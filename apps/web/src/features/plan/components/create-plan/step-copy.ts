export interface StepCopy {
  headline: string;
  supportingCopy: string;
  wide: boolean;
}

/** Shared by create and edit flows for steps 1-4; step 5 copy differs between them and stays local to each flow. */
export const STEP_COPY: Record<number, StepCopy> = {
  1: {
    headline: "Let's start with the basics",
    supportingCopy:
      "Give your plan a name and tell us how much time you want to dedicate to studying.",
    wide: false,
  },
  2: {
    headline: "What do you want to study?",
    supportingCopy:
      "Choose the subjects, topics, and subtopics you want to include. We'll organize them into your study plan next.",
    wide: true,
  },
  3: {
    headline: "When do you want to study?",
    supportingCopy:
      "Choose your study period. We'll organize your selected content across these days.",
    wide: false,
  },
  4: {
    headline: "Let's build your day-by-day plan",
    supportingCopy:
      "Assign each topic to the days you want to study it. We'll keep the timeline organized for you.",
    wide: true,
  },
};
