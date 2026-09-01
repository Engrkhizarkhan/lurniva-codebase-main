import { ArrowLeft } from "lucide-react";
import { Button } from "@lurniva/ui";

interface StepFooterProps {
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
  isFirstStep: boolean;
  nextLabel?: string;
  isSubmitting?: boolean;
  submittingLabel?: string;
  /** When provided, renders a "Save & Exit" action so the edit flow can save whatever's changed and leave without visiting the remaining steps. */
  onSaveExit?: () => void;
  saveExitLabel?: string;
  /** When provided, renders a "Cancel" action that discards the draft and leaves the wizard entirely. */
  onCancel?: () => void;
}

export function StepFooter({
  onBack,
  onNext,
  canContinue,
  isFirstStep,
  nextLabel = "Save & Continue",
  isSubmitting = false,
  submittingLabel = "Creating your plan…",
  onSaveExit,
  saveExitLabel = "Save & Exit",
  onCancel,
}: StepFooterProps) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-6">
      <div className="flex items-center gap-2.5">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        {isFirstStep ? null : (
          <Button
            type="button"
            variant="outline"
            icon={<ArrowLeft size={16} />}
            onClick={onBack}
          >
            Back
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2.5">
        {onSaveExit ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isSubmitting}
            onClick={onSaveExit}
          >
            {saveExitLabel}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          disabled={!canContinue || isSubmitting}
          onClick={onNext}
        >
          {isSubmitting ? submittingLabel : nextLabel}
        </Button>
      </div>
    </div>
  );
}
