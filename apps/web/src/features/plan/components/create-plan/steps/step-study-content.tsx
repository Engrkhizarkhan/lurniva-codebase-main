import type { UseStudyContentSelectionResult } from "../../../hooks/useStudyContentSelection";
import type { UseLibrarySelectionResult } from "../../../hooks/useLibrarySelection";
import { LibraryResourcesPanel } from "../study-content/library-resources-panel";
import { SubjectPanel } from "../study-content/subject-panel";
import { SubjectRail } from "../study-content/subject-rail";

interface StepStudyContentProps {
  content: UseStudyContentSelectionResult;
  library: UseLibrarySelectionResult;
}

export function StepStudyContent({ content, library }: StepStudyContentProps) {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-[220px_1fr]">
        <SubjectRail items={content.subjectRail} onSelect={content.selectSubject} />
        <SubjectPanel content={content} />
      </div>
      <LibraryResourcesPanel selection={library} />
    </div>
  );
}