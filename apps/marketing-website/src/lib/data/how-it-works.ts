export interface HowItWorksStep {
  number: string;
  title: string;
  description: string;
  final?: boolean;
}

export const howItWorksSteps: HowItWorksStep[] = [
  {
    number: "01",
    title: "Bring your content",
    description:
      "Upload a PDF, slides or a recording — or pick a Lurniva course.",
  },
  {
    number: "02",
    title: "Lurniva understands it",
    description: "Chapters, definitions, examples and diagrams get indexed.",
  },
  {
    number: "03",
    title: "Study, practice & revise",
    description:
      "Companion, study plan, flashcards and past-paper practice — same material.",
  },
  {
    number: "04",
    title: "Improve outcomes",
    description: "Notes, feedback and mastery tracking close the loop.",
    final: true,
  },
];
