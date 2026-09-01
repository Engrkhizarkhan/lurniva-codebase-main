import { AlertCircle, Sparkles } from "lucide-react";
import { AssessmentConfigPanel } from "../../../day-study/components/assessment/assessment-config-panel";
import { AssessmentSession } from "../../../day-study/components/assessment/assessment-session";
import type { AssessmentCounts } from "../../../day-study/lib/assessment-plan";
import type {
  AssessmentFeature,
  GenerateAssessmentResponse,
} from "../../../day-study/types";

interface AssessmentSetupProps {
  /** What the questions are generated from — null when nothing is chosen. */
  topicLabel: string | null;
  hasTopic: boolean;
  feature: AssessmentFeature | null;
  isGenerating: boolean;
  errorMessage: string | null;
  onFeatureChange: (feature: AssessmentFeature) => void;
  onStart: (feature: AssessmentFeature, counts: Partial<AssessmentCounts>) => void;
}

/**
 * Assessment mode before a run starts: choose the shape of the sitting.
 *
 * Picking a type is a card on this page; the length and the action that
 * starts the run live in the modal that choosing a card opens — one decision,
 * asked in two steps. The tutor is still reachable below the setup, because
 * deciding how to be tested is part of studying, not a separate application.
 */
export function AssessmentSetup({
  topicLabel,
  hasTopic,
  feature,
  isGenerating,
  errorMessage,
  onFeatureChange,
  onStart,
}: AssessmentSetupProps) {
  return (
    <div className="px-4 py-8 md:px-8">
      <div className="mx-auto grid max-w-200 gap-5">
        <div className="grid gap-2.5 animate-[fade-up-in_var(--dur-modal)_var(--ease-standard)]">
          <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-forest-700">
            <Sparkles size={14} />
            Lurniva AI · Assessment
          </span>
          <h1 className="font-display text-2xl font-bold tracking-[-0.01em] text-forest-900 text-pretty">
            {topicLabel
              ? `How do you want to be assessed on ${topicLabel}?`
              : "How do you want to be assessed?"}
          </h1>
          <p className="text-sm leading-relaxed text-text-muted">
            {hasTopic
              ? "Pick one. I'll use the material behind your topic to write the questions."
              : "Choose a topic in the header first — the questions are written from the material you select."}
          </p>
        </div>

        {!hasTopic ? (
          <p className="flex items-start gap-2 rounded-control border border-border-subtle bg-white px-3.5 py-3 text-sm text-text-muted">
            <AlertCircle size={15} className="mt-0.5 shrink-0 text-warning" />
            No topic is selected, so questions would have nothing to draw on.
          </p>
        ) : null}

        <AssessmentConfigPanel
          feature={feature}
          isGenerating={isGenerating}
          errorMessage={errorMessage}
          topicLabel={topicLabel}
          onFeatureChange={onFeatureChange}
          onStart={onStart}
        />
      </div>
    </div>
  );
}

interface AssessmentRunProps {
  assessment: GenerateAssessmentResponse;
  topicLabel: string | null;
  /** True once the attempt is scored — see the note on presentation below. */
  isComplete: boolean;
  onCompleted: () => void;
  /** Discards the run and returns to the setup screen. */
  onRestart: () => void;
  /** Leaves the sitting — back to setup, with the run discarded. */
  onExit: () => void;
  /** Opens the tutor with a question about the attempt just finished. */
  onAskAi: (prompt: string) => void;
}

/**
 * A sitting in progress takes the whole screen — over the app shell, not
 * inside it: nothing else is actionable while a timed, scored attempt runs.
 * Results are the opposite, so the same element sheds the overlay and settles
 * back into the page. Swapping only the wrapper's classes keeps the session
 * mounted, and with it the marks it is about to report.
 */
export function AssessmentRun({
  assessment,
  topicLabel,
  isComplete,
  onCompleted,
  onRestart,
  onExit,
  onAskAi,
}: AssessmentRunProps) {
  return (
    <div
      role={isComplete ? undefined : "dialog"}
      aria-modal={isComplete ? undefined : true}
      aria-label={isComplete ? undefined : "Assessment in progress"}
      className={
        isComplete
          ? "px-4 py-8 md:px-8"
          : "fixed inset-0 z-50 overflow-y-auto bg-surface-canvas animate-[fade-in_200ms_var(--ease-standard)]"
      }
    >
      <AssessmentSession
        assessment={assessment}
        title={topicLabel ?? "your topic"}
        onExit={onExit}
        onRestart={onRestart}
        onAskAi={onAskAi}
        onCompleted={onCompleted}
      />
    </div>
  );
}
