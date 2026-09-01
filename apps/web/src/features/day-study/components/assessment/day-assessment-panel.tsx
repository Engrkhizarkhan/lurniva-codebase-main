import { useState } from "react";
import { useGenerateAssessment } from "../../hooks/useAiAssessment";
import type { AssessmentCounts } from "../../lib/assessment-plan";
import type {
  AssessmentFeature,
  GenerateAssessmentResponse,
} from "../../types";
import { AssessmentConfigPanel } from "./assessment-config-panel";
import { AssessmentSession } from "./assessment-session";

interface DayAssessmentPanelProps {
  planId: string;
  dayNumber: number;
  feature: AssessmentFeature;
  /** Names the study set in the runner header. */
  title: string;
  onFeatureChange: (feature: AssessmentFeature) => void;
  onExit: () => void;
}

/**
 * The day page's assessment surface: configure a run, then sit it.
 *
 * The generated attempt is held here rather than on the page so mounting this
 * under a `(planId, dayNumber)` key is all it takes to drop a stale attempt
 * when the student moves to another day.
 */
export function DayAssessmentPanel({
  planId,
  dayNumber,
  feature,
  title,
  onFeatureChange,
  onExit,
}: DayAssessmentPanelProps) {
  const [assessment, setAssessment] = useState<GenerateAssessmentResponse | null>(
    null,
  );
  const generateAssessment = useGenerateAssessment(planId, dayNumber);

  function handleStart(next: AssessmentFeature, counts: Partial<AssessmentCounts>) {
    generateAssessment.mutate(
      { feature: next, counts },
      { onSuccess: (result) => setAssessment(result) },
    );
  }

  if (assessment) {
    return (
      <AssessmentSession
        assessment={assessment}
        title={title}
        onExit={onExit}
        onRestart={() => setAssessment(null)}
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <AssessmentConfigPanel
        feature={feature}
        isGenerating={generateAssessment.isPending}
        errorMessage={generateAssessment.error?.message ?? null}
        topicLabel={title}
        // The study-tools menu already picked the type to get here, so the
        // length modal opens immediately instead of waiting for a re-click.
        autoOpen
        onFeatureChange={onFeatureChange}
        onStart={handleStart}
      />
    </div>
  );
}
