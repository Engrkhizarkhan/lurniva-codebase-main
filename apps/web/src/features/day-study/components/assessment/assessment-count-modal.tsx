import { useEffect, useRef } from "react";
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  Layers,
  ListChecks,
  Loader2,
  PenLine,
  Sparkles,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  ASSESSMENT_PRESETS,
  activeCountKeys,
  estimateMinutes,
  totalQuestions,
} from "../../lib/assessment-plan";
import type { AssessmentCountKey, AssessmentCounts } from "../../lib/assessment-plan";
import { AI_FEATURE_BY_ID } from "../../constants/features";
import type { AssessmentFeature } from "../../types";
import { CountPresets, CountStepper } from "./count-field";

/** What each count field is called, and — in a mock exam — what it tests. */
export const COUNT_META: Record<
  AssessmentCountKey,
  { label: string; unit: string; note: string; icon: LucideIcon }
> = {
  mcqs: {
    label: "Multiple choice questions",
    unit: "MCQs",
    note: "Recall and reasoning",
    icon: ListChecks,
  },
  shortQuestions: {
    label: "Short questions",
    unit: "short questions",
    note: "Explain in your own words",
    icon: PenLine,
  },
  flashcards: {
    label: "Flashcards",
    unit: "flashcards",
    note: "Rapid recall",
    icon: Layers,
  },
};

interface AssessmentCountModalProps {
  open: boolean;
  feature: AssessmentFeature;
  /** Names the material in the eyebrow — omitted when nothing is chosen. */
  topicLabel?: string | null;
  counts: AssessmentCounts;
  isGenerating: boolean;
  errorMessage?: string | null;
  onCountChange: (key: AssessmentCountKey, value: number) => void;
  onClose: () => void;
  onStart: () => void;
}

/**
 * How long the sitting should be, asked as a modal.
 *
 * Choosing a format and choosing a length are one decision made in one place,
 * so the length is not a panel that grows out of the page — it is the second
 * half of the same question, and it is where the run actually starts from.
 *
 * It cannot be dismissed while questions are being written: the request is
 * already in flight, and the button it came from is inside this dialog.
 */
export function AssessmentCountModal({
  open,
  feature,
  topicLabel,
  counts,
  isGenerating,
  errorMessage,
  onCountChange,
  onClose,
  onStart,
}: AssessmentCountModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isGenerating) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isGenerating, onClose]);

  // Move the caret into the dialog so the keyboard and screen readers follow
  // the eye — without it, Escape would go to whatever was focused behind.
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const meta = AI_FEATURE_BY_ID[feature];
  const isMock = feature === "mock_exam";
  const keys = activeCountKeys(feature);
  const unit = isMock ? "questions" : COUNT_META[keys[0]!].unit;
  const total = totalQuestions(counts);
  const minutes = estimateMinutes(counts);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-surface-overlay p-4 md:p-8 animate-[fade-in_200ms_var(--ease-standard)]"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isGenerating) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${meta.label} setup`}
        tabIndex={-1}
        className="grid w-full max-w-[720px] gap-6 rounded-modal bg-white p-6 shadow-modal outline-none md:p-8 animate-[fade-up-in_var(--dur-modal)_var(--ease-spring)]"
      >
        <div className="flex items-start gap-5">
          <div className="grid min-w-0 flex-1 gap-2">
            <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-forest-700">
              <Sparkles size={14} className="shrink-0" />
              <span className="truncate">
                {meta.label}
                {topicLabel ? ` · ${topicLabel}` : ""}
              </span>
            </span>
            <h2 className="font-display text-2xl font-bold tracking-[-0.02em] text-forest-900 text-pretty">
              {isMock
                ? "Mock exam setup"
                : `How many ${unit.toLowerCase()} would you like?`}
            </h2>
            <p className="text-sm leading-relaxed text-text-muted">
              {isMock
                ? "Set each section. One score at the end."
                : "Pick a preset or enter your own number."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            aria-label="Close"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg text-text-muted transition-colors duration-150 hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        {isMock ? (
          <div className="grid gap-3">
            <div className="grid gap-0.5 rounded-control bg-surface-sunken p-1.5">
              {keys.map((key) => (
                <CountStepper
                  key={key}
                  countKey={key}
                  label={COUNT_META[key].label}
                  note={COUNT_META[key].note}
                  icon={COUNT_META[key].icon}
                  value={counts[key]}
                  disabled={isGenerating}
                  onChange={(value) => onCountChange(key, value)}
                />
              ))}
            </div>
            <span className="text-xs text-text-faint">
              Three sections, one exam. Scored together.
            </span>
          </div>
        ) : (
          keys.map((key) => (
            <CountPresets
              key={key}
              countKey={key}
              label={COUNT_META[key].label}
              value={counts[key]}
              presets={ASSESSMENT_PRESETS[feature]}
              disabled={isGenerating}
              onChange={(value) => onCountChange(key, value)}
            />
          ))
        )}

        {errorMessage ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-error-soft px-3 py-2 text-sm text-error"
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-4 border-t border-border-subtle pt-5">
          <p className="flex min-w-40 flex-1 items-center gap-2 text-sm font-semibold tabular-nums text-forest-900">
            <Clock3 size={15} className="text-text-muted" />
            {total} {unit.toLowerCase()} · ~{minutes} min
          </p>

          <button
            type="button"
            disabled={isGenerating}
            onClick={onStart}
            className="inline-flex h-12 items-center justify-center gap-2.5 rounded-control bg-ember-500 px-6 text-[15px] font-semibold text-cream-100 transition-colors duration-150 hover:bg-ember-600 disabled:cursor-not-allowed disabled:bg-sand-300 disabled:text-text-faint"
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Writing your questions…
              </>
            ) : (
              <>
                {isMock
                  ? `Start mock exam · ${total} questions`
                  : `Start ${total} ${unit.toLowerCase()}`}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
