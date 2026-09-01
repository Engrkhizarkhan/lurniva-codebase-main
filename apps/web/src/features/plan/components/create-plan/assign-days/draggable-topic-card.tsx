import { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { UnscheduledTopic } from "../../../lib/timeline-math";
import { DraggableSubtopicRow } from "./draggable-subtopic-row";

interface DraggableTopicCardProps {
  topic: UnscheduledTopic;
}

export function DraggableTopicCard({ topic }: DraggableTopicCardProps) {
  const [expanded, setExpanded] = useState(true);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable(
    {
      id: `topic:${topic.topicId}`,
      data: { type: "unscheduled-topic", topic },
    },
  );

  return (
    <div
      className={cn(
        "rounded-xl border border-border-subtle bg-surface-card",
        isDragging && "opacity-40",
      )}
    >
      <div
        ref={setNodeRef}
        style={{ transform: CSS.Translate.toString(transform) }}
        className="flex items-center gap-1.5 py-2 pr-2"
      >
        <button
          type="button"
          {...listeners}
          {...attributes}
          aria-label={`Drag ${topic.topicLabel} onto a day`}
          className="flex size-8 shrink-0 cursor-grab items-center justify-center text-text-faint active:cursor-grabbing"
        >
          <GripVertical size={15} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-muted">{topic.subjectLabel}</p>
          <p className="truncate text-sm font-bold text-text-heading">
            {topic.topicLabel}
          </p>
          <p className="text-xs text-text-faint">
            {topic.remainingCount} subtopic{topic.remainingCount === 1 ? "" : "s"} ·{" "}
            {topic.isPartiallyScheduled ? "Partially scheduled" : "Not scheduled"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse subtopics" : "Expand subtopics"}
          className="flex size-8 shrink-0 items-center justify-center text-text-muted hover:text-text-body"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {expanded ? (
        <div className="grid gap-0.5 border-t border-border-subtle pb-2 pt-1">
          {topic.remainingSubtopicIds.map((subtopicId, index) => (
            <DraggableSubtopicRow
              key={subtopicId}
              topic={topic}
              subtopicId={subtopicId}
              label={topic.remainingSubtopicLabels[index] ?? subtopicId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
