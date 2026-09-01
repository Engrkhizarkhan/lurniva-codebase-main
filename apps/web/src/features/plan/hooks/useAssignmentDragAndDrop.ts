import { useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import type { ScheduleAssignment } from "../create-plan-types";
import type { UnscheduledChapter, UnscheduledTopic } from "../lib/timeline-math";

const DAY_DROPPABLE_PREFIX = "day-";

export function dayDroppableId(dayIndex: number): string {
  return `${DAY_DROPPABLE_PREFIX}${dayIndex}`;
}

function parseDayDroppableId(id: string | number): number | null {
  const raw = String(id);
  if (!raw.startsWith(DAY_DROPPABLE_PREFIX)) return null;
  const dayIndex = Number(raw.slice(DAY_DROPPABLE_PREFIX.length));
  return Number.isFinite(dayIndex) ? dayIndex : null;
}

type DraggableData =
  | { type: "unscheduled-topic"; topic: UnscheduledTopic }
  | { type: "unscheduled-chapter"; chapter: UnscheduledChapter }
  | { type: "assignment"; assignment: ScheduleAssignment };

export type ActiveDragItem = DraggableData;

interface UseAssignmentDragAndDropArgs {
  onAssignTopicToDay: (topic: UnscheduledTopic, dayIndex: number) => void;
  onAssignChapterToDay: (chapter: UnscheduledChapter, dayIndex: number) => void;
  onMoveAssignment: (assignmentId: string, dayIndex: number) => void;
}

export function useAssignmentDragAndDrop({
  onAssignTopicToDay,
  onAssignChapterToDay,
  onMoveAssignment,
}: UseAssignmentDragAndDropArgs) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );
  const [activeItem, setActiveItem] = useState<ActiveDragItem | null>(null);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current as DraggableData | undefined;
    if (data) setActiveItem(data);
  }

  function handleDragEnd(event: DragEndEvent) {
    const data = event.active.data.current as DraggableData | undefined;
    const dayIndex = event.over ? parseDayDroppableId(event.over.id) : null;

    if (data && dayIndex !== null) {
      if (data.type === "unscheduled-topic") {
        onAssignTopicToDay(data.topic, dayIndex);
      } else if (data.type === "unscheduled-chapter") {
        onAssignChapterToDay(data.chapter, dayIndex);
      } else {
        onMoveAssignment(data.assignment.assignmentId, dayIndex);
      }
    }
    setActiveItem(null);
  }

  function handleDragCancel() {
    setActiveItem(null);
  }

  return {
    sensors,
    activeItem,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
  };
}
