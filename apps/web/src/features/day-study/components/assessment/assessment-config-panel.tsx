import { useState } from "react";
import { DEFAULT_ASSESSMENT_COUNTS, pickActiveCounts } from "../../lib/assessment-plan";
import type { AssessmentCountKey, AssessmentCounts } from "../../lib/assessment-plan";
import type { AssessmentFeature } from "../../types";
import { AssessmentCountModal } from "./assessment-count-modal";
import { AssessmentTypeSelector } from "./assessment-type-selector";

interface AssessmentConfigPanelProps {
  feature: AssessmentFeature | null;
  isGenerating: boolean;
  errorMessage?: string | null;
  /** Names the material in the modal's eyebrow. */
  topicLabel?: string | null;
  /**
   * Opens the length modal as soon as the panel mounts with a type already
   * chosen — for callers where picking the type was the click that got here.
   */
  autoOpen?: boolean;
  onFeatureChange: (feature: AssessmentFeature) => void;
  onStart: (feature: AssessmentFeature, counts: Partial<AssessmentCounts>) => void;
}

/**
 * Configures a run before generating it. The page asks one question — what
 * kind of practice — and the length, and the action that starts the run, live
 * in the modal that choosing a type opens.
 */
export function AssessmentConfigPanel({
  feature,
  isGenerating,
  errorMessage,
  topicLabel,
  autoOpen = false,
  onFeatureChange,
  onStart,
}: AssessmentConfigPanelProps) {
  const [counts, setCounts] = useState<AssessmentCounts>(
    () => DEFAULT_ASSESSMENT_COUNTS[feature ?? "mcqs"],
  );
  const [countsFor, setCountsFor] = useState(autoOpen ? null : feature);
  const [isModalOpen, setModalOpen] = useState(false);

  // Each type carries its own sensible defaults, so switching type resets the
  // counts rather than carrying "50 flashcards" over to a short-question run.
  // Adjusted during render rather than in an effect — React re-runs this
  // component before committing, so no extra pass reaches the DOM.
  if (feature && feature !== countsFor) {
    setCountsFor(feature);
    setCounts(DEFAULT_ASSESSMENT_COUNTS[feature]);
  }

  function updateCount(key: AssessmentCountKey, value: number) {
    setCounts((current) => ({ ...current, [key]: value }));
  }

  return (
    <>
      <AssessmentTypeSelector
        value={feature}
        disabled={isGenerating}
        // Re-picking the current type is how the student reopens the length
        // modal after dismissing it, so this always opens it — a fresh pick
        // changing `feature` would trigger a remount of the modal's defaults
        // anyway, via `countsFor` above.
        onChange={(next) => {
          onFeatureChange(next);
          setModalOpen(true);
        }}
      />

      {feature ? (
        <AssessmentCountModal
          open={isModalOpen}
          feature={feature}
          topicLabel={topicLabel}
          counts={counts}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          onCountChange={updateCount}
          onClose={() => setModalOpen(false)}
          onStart={() => onStart(feature, pickActiveCounts(feature, counts))}
        />
      ) : null}
    </>
  );
}
