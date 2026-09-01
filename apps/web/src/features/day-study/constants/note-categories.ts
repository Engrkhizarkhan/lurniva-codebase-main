import { AlertCircle, Highlighter, Lightbulb, Sigma, Target } from "lucide-react";
import type { NoteCategory } from "../types";

/**
 * Buckets a student can file highlighted text into from the editor's selection
 * menu. Not part of the design file — the categories and copy are ours; only
 * the swatch colours come from the design system's highlight palette.
 */
export const NOTE_CATEGORIES: NoteCategory[] = [
  {
    id: "key-idea",
    label: "Key idea",
    description: "The core claim you must be able to state from memory",
    icon: Lightbulb,
    color: "var(--color-lime-500)",
  },
  {
    id: "formula",
    label: "Formula",
    description: "An equation, constant, or unit you'll be asked to apply",
    icon: Sigma,
    color: "var(--color-amber-500)",
  },
  {
    id: "exam-tip",
    label: "Exam tip",
    description: "A trap, shortcut, or marking point worth remembering",
    icon: Target,
    color: "var(--color-ember-500)",
  },
  {
    id: "definition",
    label: "Definition",
    description: "Vocabulary you should be able to write out precisely",
    icon: Highlighter,
    color: "var(--color-teal-500)",
  },
  {
    id: "revisit",
    label: "Revisit",
    description: "Didn't click yet — bring it back in the next review pass",
    icon: AlertCircle,
    color: "var(--color-clay-500)",
  },
];

export const NOTE_CATEGORY_BY_ID: Record<string, NoteCategory> = Object.fromEntries(
  NOTE_CATEGORIES.map((category) => [category.id, category]),
);
