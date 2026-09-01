import { Atom, BookOpen, Sigma } from "lucide-react";
import type { ComponentType } from "react";
import type { LucideProps } from "lucide-react";

type IconComponent = ComponentType<LucideProps>;

// DB catalog rows only carry a name — icons are a purely client-side
// presentation concern, keyed by subject name (case-insensitive).
const SUBJECT_ICONS: Record<string, IconComponent> = {
  maths: Sigma,
  mathematics: Sigma,
  physics: Atom,
};

export function getSubjectIcon(subjectName: string): IconComponent {
  return SUBJECT_ICONS[subjectName.trim().toLowerCase()] ?? BookOpen;
}
