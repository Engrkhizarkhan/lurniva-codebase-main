import { Check, Loader2, X } from "lucide-react";
import { cn } from "@lurniva/ui";
import AiMarkdown from "../ai-markdown";
import type { ShortQuestion } from "../../types";

interface ShortQuestionViewProps {
  question: ShortQuestion;
  value: string;
  submitted: boolean;
  isGrading: boolean;
  isCorrect: boolean | null;
  feedback: string | null;
  modelAnswer: string | null;
  onChange: (value: string) => void;
}

const SOFT_LIMIT = 1200;

/**
 * An open-ended answer, graded by the same AI assessment service the day page
 * uses — the response comes back through `submitAssessmentAnswer`, so there is
 * no separate evaluation path here.
 */
export function ShortQuestionView({
  question,
  value,
  submitted,
  isGrading,
  isCorrect,
  feedback,
  modelAnswer,
  onChange,
}: ShortQuestionViewProps) {
  const remaining = SOFT_LIMIT - value.length;

  return (
    <div className="grid gap-6">
      <h2 className="font-display text-2xl font-bold leading-snug tracking-[-0.01em] text-forest-900 text-pretty">
        {question.prompt}
      </h2>

      <div className="grid gap-1.5">
        <label htmlFor={`answer-${question.id}`} className="sr-only">
          Your answer
        </label>
        <textarea
          id={`answer-${question.id}`}
          rows={7}
          value={value}
          disabled={submitted || isGrading}
          maxLength={SOFT_LIMIT}
          placeholder="Write your answer in a few sentences…"
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "w-full resize-y rounded-xl border bg-white p-3.5 text-sm leading-relaxed text-text-body",
            "placeholder:text-text-faint focus-visible:outline-2 focus-visible:outline-border-focus",
            "disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:opacity-80",
            submitted ? "border-border-subtle" : "border-border-default",
          )}
        />
        {!submitted ? (
          <p
            className={cn(
              "text-right text-xs",
              remaining < 100 ? "text-warning" : "text-text-faint",
            )}
          >
            {value.trim().length === 0
              ? "A couple of sentences is usually enough."
              : `${remaining} characters left`}
          </p>
        ) : null}
      </div>

      {isGrading ? (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Loader2 size={15} className="animate-spin" />
          Marking your answer…
        </p>
      ) : null}

      {submitted && !isGrading ? (
        <div className="grid gap-3">
          {isCorrect !== null ? (
            <p
              className={cn(
                "inline-flex w-fit items-center gap-2 rounded-pill px-3 py-1.5 text-sm font-semibold",
                isCorrect
                  ? "bg-success-soft text-success"
                  : "bg-warning-soft text-text-heading",
              )}
            >
              {isCorrect ? <Check size={15} /> : <X size={15} />}
              {isCorrect ? "Covers the key ideas" : "Some gaps to close"}
            </p>
          ) : null}

          {feedback ? (
            <div className="rounded-xl border border-border-subtle bg-surface-subtle p-3.5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
                Feedback
              </p>
              <AiMarkdown content={feedback} compact />
            </div>
          ) : null}

          {modelAnswer ? (
            <div className="rounded-xl border border-border-subtle bg-white p-3.5">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
                Model answer
              </p>
              <AiMarkdown content={modelAnswer} compact />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
