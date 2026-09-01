import { motion } from "motion/react";
import { GripVertical } from "lucide-react";
import type { ActiveDragItem } from "../../../hooks/useAssignmentDragAndDrop";
import type { CatalogLookupEntry, LibraryLookupEntry } from "../../../lib/timeline-math";
import { getAssignmentDisplayInfo } from "../../../lib/timeline-math";

interface DragOverlayPreviewProps {
  item: ActiveDragItem;
  catalogLookup: Map<string, CatalogLookupEntry>;
  libraryLookup: Map<string, LibraryLookupEntry>;
}

export function DragOverlayPreview({
  item,
  catalogLookup,
  libraryLookup,
}: DragOverlayPreviewProps) {
  const subjectLabel =
    item.type === "unscheduled-topic"
      ? item.topic.subjectLabel
      : item.type === "unscheduled-chapter"
        ? item.chapter.libraryItemTitle
        : getAssignmentDisplayInfo(item.assignment, catalogLookup, libraryLookup)
            .breadcrumbSubject;
  const title =
    item.type === "unscheduled-topic"
      ? item.topic.topicLabel
      : item.type === "unscheduled-chapter"
        ? item.chapter.chapterTitle
        : getAssignmentDisplayInfo(item.assignment, catalogLookup, libraryLookup).title;

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.12 }}
      className="flex items-center gap-2.5 rounded-xl border border-primary bg-surface-card px-3.5 py-2.5 shadow-lg"
    >
      <GripVertical size={15} className="text-text-faint" />
      <div>
        <p className="text-xs font-medium text-text-muted">{subjectLabel}</p>
        <p className="text-sm font-bold text-text-heading">{title}</p>
      </div>
    </motion.div>
  );
}
