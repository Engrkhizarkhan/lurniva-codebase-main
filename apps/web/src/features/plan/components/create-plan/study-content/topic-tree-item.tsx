import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, ChevronRight, Minus } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { TopicSelectionItem } from "../../../hooks/useStudyContentSelection";
import { SubtopicRow } from "./subtopic-row";

interface TopicTreeItemProps {
  topic: TopicSelectionItem;
  onToggleExpanded: () => void;
  onToggleTopic: () => void;
  onToggleSubtopic: (subtopicId: string) => void;
}

export function TopicTreeItem({
  topic,
  onToggleExpanded,
  onToggleTopic,
  onToggleSubtopic,
}: TopicTreeItemProps) {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card">
      <div className="flex items-center gap-1 py-1 pr-2">
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={topic.expanded}
          aria-label={topic.expanded ? "Collapse topic" : "Expand topic"}
          className="flex size-8 shrink-0 items-center justify-center text-text-muted hover:text-text-body"
        >
          {topic.expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <button
          type="button"
          role="checkbox"
          aria-checked={
            topic.selectionState === "all"
              ? true
              : topic.selectionState === "some"
                ? "mixed"
                : false
          }
          onClick={onToggleTopic}
          className="flex flex-1 items-center gap-2.5 py-1.5 text-left"
        >
          <span
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded border",
              topic.selectionState === "all"
                ? "border-primary bg-primary"
                : topic.selectionState === "some"
                  ? "border-primary bg-primary-soft"
                  : "border-border-default bg-surface-raised",
            )}
          >
            {topic.selectionState === "all" ? (
              <Check size={11} strokeWidth={3} className="text-text-on-primary" />
            ) : null}
            {topic.selectionState === "some" ? (
              <Minus size={11} strokeWidth={3} className="text-primary" />
            ) : null}
          </span>
          <span className="text-sm font-semibold text-text-heading">
            {topic.label}
          </span>
          <span className="text-xs text-text-faint">
            {topic.subtopics.length} subtopics
          </span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {topic.expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="grid gap-0.5 pb-2">
              {topic.subtopics.map((subtopic) => (
                <SubtopicRow
                  key={subtopic.subtopicId}
                  subtopic={subtopic}
                  onToggle={() => onToggleSubtopic(subtopic.subtopicId)}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
