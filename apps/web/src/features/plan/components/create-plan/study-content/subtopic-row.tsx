import { Check } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { SubtopicSelectionItem } from "../../../hooks/useStudyContentSelection";

interface SubtopicRowProps {
  subtopic: SubtopicSelectionItem;
  onToggle: () => void;
}

export function SubtopicRow({ subtopic, onToggle }: SubtopicRowProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={subtopic.selected}
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-lg py-1.5 pl-9 pr-2 text-left hover:bg-surface-sunken"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border",
          subtopic.selected
            ? "border-primary bg-primary"
            : "border-border-default bg-surface-raised",
        )}
      >
        {subtopic.selected ? (
          <Check size={11} strokeWidth={3} className="text-text-on-primary" />
        ) : null}
      </span>
      <span className="text-sm text-text-body">{subtopic.label}</span>
    </button>
  );
}
