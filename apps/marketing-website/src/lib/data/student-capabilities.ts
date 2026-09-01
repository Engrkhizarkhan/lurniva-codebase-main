import type { IconName } from "@lurniva/ui";

export interface StudentCapability {
  icon: IconName;
  title: string;
  description: string;
}

export const studentCapabilities: StudentCapability[] = [
  {
    icon: "message-circle",
    title: "Understand a concept",
    description: "Ask in your own words. The answer cites the page it came from.",
  },
  {
    icon: "file-text",
    title: "Summarise a chapter",
    description: "Long PDF in, revision notes out — kept in My Notes.",
  },
  {
    icon: "layers",
    title: "Turn it into practice",
    description: "Flashcards and quizzes generated from the same material.",
  },
  {
    icon: "upload",
    title: "Study your own uploads",
    description: "Your teacher's handout works exactly like a Lurniva course.",
  },
];

export const aiKeyPoints = [
  "Cristae = folded inner membrane",
  "More surface area → more ATP",
  "Matrix holds the Krebs cycle enzymes",
];
