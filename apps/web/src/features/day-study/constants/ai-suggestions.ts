import {
  BookOpen,
  CircleHelp,
  FileText,
  Layers,
  Pencil,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";
import type { AiExplorePill, AiSuggestion } from "../types";

/**
 * The six empty-state cards from the design, in design order. Presentation
 * lives in `ai-suggestions.tsx`; this file only carries the data.
 */
export const AI_SUGGESTIONS: AiSuggestion[] = [
  {
    id: "overview",
    title: "What is this study set about?",
    description: "Get an overview",
    icon: CircleHelp,
    tone: "forest",
    prompt: "What is this study set about?",
  },
  {
    id: "connections",
    title: "How do these topics connect?",
    description: "See relationships",
    icon: Share2,
    tone: "teal",
    prompt: "How do these topics connect?",
  },
  {
    id: "study-plan",
    title: "Create a study plan for me",
    description: "Personalized plan",
    icon: BookOpen,
    tone: "lime",
    prompt: "Create a study plan for me",
  },
  {
    id: "quiz",
    title: "Quiz me on this study set",
    description: "Test your knowledge",
    icon: Pencil,
    tone: "ember",
    prompt: "Quiz me on this study set",
  },
  {
    id: "flashcards",
    title: "Generate flashcards",
    description: "Smart flashcards",
    icon: Layers,
    tone: "amber",
    prompt: "Generate flashcards",
  },
  {
    id: "summary",
    title: "Create a study summary",
    description: "Key takeaways",
    icon: FileText,
    tone: "forest",
    prompt: "Create a study summary",
  },
];

/** The two pills below the "Explore more" divider. */
export const AI_EXPLORE_PILLS: AiExplorePill[] = [
  {
    id: "personalities",
    label: "Personalities & Skillsets",
    icon: Users,
    prompt: "Show me personalities & skillsets for studying",
  },
  {
    id: "scenarios",
    label: "Study Scenarios",
    icon: Sparkles,
    prompt: "Show me study scenarios",
  },
];
