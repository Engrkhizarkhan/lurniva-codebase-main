import type { CatalogSubject } from "../../../create-plan-types";
import type { UseTimelineAssignmentResult } from "../../../hooks/useTimelineAssignment";
import type { LibraryItemDto } from "../../../../library/services/library-items";
import { TimelinePanel } from "../assign-days/timeline-panel";

interface StepAssignDaysProps {
  subjects: CatalogSubject[];
  libraryItems: LibraryItemDto[];
  timeline: UseTimelineAssignmentResult;
  librarySelectedCount: number;
}

export function StepAssignDays({
  subjects,
  libraryItems,
  timeline,
  librarySelectedCount,
}: StepAssignDaysProps) {
  return (
    <TimelinePanel
      subjects={subjects}
      libraryItems={libraryItems}
      timeline={timeline}
      librarySelectedCount={librarySelectedCount}
    />
  );
}
