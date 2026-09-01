import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { UnscheduledTopic } from "../../../lib/timeline-math";

interface DraggableSubtopicRowProps {
  topic: UnscheduledTopic;
  subtopicId: string;
  label: string;
}

export function DraggableSubtopicRow({
  topic,
  subtopicId,
  label,
}: DraggableSubtopicRowProps) {
  const singleSubtopic: UnscheduledTopic = {
    ...topic,
    remainingSubtopicIds: [subtopicId],
    remainingSubtopicLabels: [label],
    remainingCount: 1,
  };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable(
    {
      id: `subtopic:${topic.topicId}:${subtopicId}`,
      data: { type: "unscheduled-topic", topic: singleSubtopic },
    },
  );

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={cn(
        "flex cursor-grab items-center gap-2 rounded-lg py-1.5 pl-8 pr-2 text-left active:cursor-grabbing",
        isDragging ? "opacity-40" : "hover:bg-surface-sunken",
      )}
    >
      <GripVertical size={13} className="shrink-0 text-text-faint" />
      <span className="text-sm text-text-body">{label}</span>
    </div>
  );
}
