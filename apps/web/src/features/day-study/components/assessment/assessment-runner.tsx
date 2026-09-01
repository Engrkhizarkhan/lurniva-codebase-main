import type { ReactNode } from "react";
import { cn } from "@lurniva/ui";
import { ArrowLeft, ArrowRight, Clock3, X } from "lucide-react";

interface AssessmentRunnerProps {
  /** The study set being tested — shown as the eyebrow above the question. */
  title: string;
  /** Mock exams move between sections; single-type runs pass their own label. */
  sectionLabel: string;
  questionIndex: number;
  questionCount: number;
  /** Seconds left when the run is timed; omitted otherwise. */
  secondsRemaining?: number | null;
  canGoPrevious: boolean;
  /** One line under the question telling the student what happens next. */
  hint: string;
  primaryLabel: string;
  primaryDisabled: boolean;
  onPrevious: () => void;
  onPrimary: () => void;
  onExit: () => void;
  children: ReactNode;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/**
 * The shell every assessment type runs inside — deliberately a room of its
 * own: exit, progress and time at the top, the question alone in the middle,
 * and a single next action at the bottom. It owns only that framing, so each
 * question view stays presentational and the four types stay one experience.
 *
 * Progression is gated on the primary action: there is no skip, because an
 * unanswered question would score as neither right nor wrong.
 */
export function AssessmentRunner({
  title,
  sectionLabel,
  questionIndex,
  questionCount,
  secondsRemaining,
  canGoPrevious,
  hint,
  primaryLabel,
  primaryDisabled,
  onPrevious,
  onPrimary,
  onExit,
  children,
}: AssessmentRunnerProps) {
  const progress = questionCount > 0 ? ((questionIndex + 1) / questionCount) * 100 : 0;
  const timeUp = typeof secondsRemaining === "number" && secondsRemaining <= 0;

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface-canvas">
      <header className="flex h-16 shrink-0 items-center gap-5 border-b border-border-subtle bg-white px-4 md:px-7">
        <button
          type="button"
          onClick={onExit}
          className="flex shrink-0 items-center gap-2 text-sm font-semibold text-text-muted transition-colors duration-150 hover:text-forest-900"
        >
          <X size={17} />
          <span className="hidden sm:inline">Exit</span>
        </button>

        <div className="mx-auto flex min-w-0 max-w-[520px] flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between gap-3 whitespace-nowrap text-xs font-semibold tabular-nums text-text-muted">
            <span>
              Question {questionIndex + 1} of {questionCount}
            </span>
            <span className="truncate">{sectionLabel}</span>
          </div>
          <div
            className="h-1.5 overflow-hidden rounded-pill bg-surface-sunken"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={questionCount}
            aria-valuenow={questionIndex + 1}
            aria-label="Assessment progress"
          >
            <span
              className="block h-full rounded-pill bg-forest-800 transition-[width] duration-300 ease-standard"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {typeof secondsRemaining === "number" ? (
          <span
            className={cn(
              "flex shrink-0 items-center gap-1.5 text-sm font-semibold tabular-nums",
              timeUp ? "text-error" : "text-forest-900",
            )}
            aria-live="polite"
          >
            <Clock3 size={16} className={timeUp ? undefined : "text-text-muted"} />
            {timeUp ? "Time up" : formatClock(secondsRemaining)}
          </span>
        ) : (
          <span className="w-9 shrink-0" aria-hidden />
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-8 md:px-7 md:py-12">
        {/* Keyed by question so moving through the queue animates the swap. */}
        <div
          key={questionIndex}
          className="mx-auto flex max-w-[720px] flex-col gap-7 animate-[fade-up-in_var(--dur-modal)_var(--ease-standard)]"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-faint">
            {title}
          </span>
          {children}
        </div>
      </div>

      <footer className="shrink-0 border-t border-border-subtle bg-white px-4 py-4 md:px-7">
        <div className="mx-auto flex max-w-[720px] items-center gap-4">
          {canGoPrevious ? (
            <button
              type="button"
              onClick={onPrevious}
              aria-label="Previous question"
              className="flex size-10 shrink-0 items-center justify-center rounded-control border border-border-default text-text-body transition-colors duration-150 hover:bg-surface-sunken"
            >
              <ArrowLeft size={16} />
            </button>
          ) : null}

          <span className="min-w-0 flex-1 text-[13px] text-text-faint">{hint}</span>

          <button
            type="button"
            onClick={onPrimary}
            disabled={primaryDisabled}
            className={cn(
              "inline-flex h-12 shrink-0 items-center justify-center gap-2.5 rounded-control px-6 text-[15px] font-semibold transition-colors duration-150",
              primaryDisabled
                ? "cursor-not-allowed bg-sand-300 text-text-faint"
                : "bg-ember-500 text-cream-100 hover:bg-ember-600",
            )}
          >
            {primaryLabel}
            <ArrowRight size={17} />
          </button>
        </div>
      </footer>
    </div>
  );
}
