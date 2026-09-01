import {
  Clock3,
  FileText,
  Layers,
  ListChecks,
  NotebookPen,
  PenLine,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AiFeature, AiMode, AssessmentFeature, LearningFeature } from "../types";

export type FeatureTone =
  | "info"
  | "primary"
  | "success"
  | "secondary"
  | "warning"
  | "accent";

export interface AiFeatureMeta {
  id: AiFeature;
  mode: AiMode;
  label: string;
  description: string;
  icon: LucideIcon;
  tone: FeatureTone;
}

/**
 * Single source of truth for every study mode. The header dropdown and the
 * main-content switcher both read from this list — add a new mode by adding
 * an entry here, a case in `day-study-page.tsx`'s switcher, and a component.
 */
export const AI_FEATURES: AiFeatureMeta[] = [
  {
    id: "summarize",
    mode: "learning",
    label: "Summarize",
    description: "A concise overview of today's topic",
    icon: FileText,
    tone: "info",
  },
  {
    id: "revision_notes",
    mode: "learning",
    label: "Revision notes",
    description: "Structured notes for focused review",
    icon: NotebookPen,
    tone: "primary",
  },
  {
    id: "last_minute_notes",
    mode: "learning",
    label: "Last-minute notes",
    description: "The essentials, right before a test",
    icon: Clock3,
    tone: "warning",
  },
  {
    id: "flashcards",
    mode: "assessment",
    label: "Flashcards",
    description: "Rapid recall and memory-based learning.",
    icon: Layers,
    tone: "secondary",
  },
  {
    id: "mcqs",
    mode: "assessment",
    label: "MCQs",
    description: "Test your understanding through multiple-choice questions.",
    icon: ListChecks,
    tone: "success",
  },
  {
    id: "short_questions",
    mode: "assessment",
    label: "Short questions",
    description: "Explain concepts in your own words.",
    icon: PenLine,
    tone: "info",
  },
  {
    id: "mock_exam",
    mode: "assessment",
    label: "Mock exam",
    description: "One exam combining all three formats.",
    icon: Target,
    tone: "accent",
  },
];

export const AI_FEATURE_BY_ID: Record<AiFeature, AiFeatureMeta> = Object.fromEntries(
  AI_FEATURES.map((feature) => [feature.id, feature]),
) as Record<AiFeature, AiFeatureMeta>;

export function getLearningFeatures(): AiFeatureMeta[] {
  return AI_FEATURES.filter((feature) => feature.mode === "learning");
}

export function getAssessmentFeatures(): AiFeatureMeta[] {
  return AI_FEATURES.filter((feature) => feature.mode === "assessment");
}

export function isLearningFeature(id: AiFeature): id is LearningFeature {
  return AI_FEATURE_BY_ID[id].mode === "learning";
}

export function isAssessmentFeature(id: AiFeature): id is AssessmentFeature {
  return AI_FEATURE_BY_ID[id].mode === "assessment";
}

const TONE_CLASSES: Record<FeatureTone, string> = {
  info: "bg-info-soft text-info",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  secondary: "bg-secondary-soft text-secondary",
  warning: "bg-warning-soft text-warning",
  accent: "bg-accent-soft text-accent",
};

export function getFeatureToneClasses(tone: FeatureTone): string {
  return TONE_CLASSES[tone];
}

/**
 * What picking a learning mode asks the tutor for. Learning study is
 * conversational, so these run through the same chat turn as a typed question
 * rather than opening a separate surface.
 */
export const LEARNING_PROMPTS: Record<LearningFeature, string> = {
  summarize: "Summarise today's topics for me.",
  revision_notes: "Turn today's topics into structured revision notes.",
  last_minute_notes:
    "Give me last-minute revision notes for today's topics — only what is most testable.",
};
