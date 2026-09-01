import { Check, Sparkles, X } from "lucide-react";
import { cn } from "@lurniva/ui";
import AiMarkdown from "../ai-markdown";
import type { McqQuestion } from "../../types";

interface McqQuestionViewProps {
  question: McqQuestion;
  selectedOptionIdx: number | null;
  /** Set once the answer has been submitted; null while still answering. */
  correctOptionIdx: number | null;
  feedback: string | null;
  submitted: boolean;
  onSelect: (optionIdx: number) => void;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

/**
 * A multiple-choice question. Nothing about correctness is shown until the
 * answer is submitted — before that the only state an option carries is
 * whether it is the one chosen. Once it is, the chosen and the correct option
 * are marked with a glyph as well as a colour.
 */
export function McqQuestionView({
  question,
  selectedOptionIdx,
  correctOptionIdx,
  feedback,
  submitted,
  onSelect,
}: McqQuestionViewProps) {
  const revealed = submitted && correctOptionIdx !== null;
  const gotItRight = revealed && selectedOptionIdx === correctOptionIdx;

  return (
    <div className="grid gap-7">
      <h2 className="font-display text-2xl font-bold leading-snug tracking-[-0.01em] text-forest-900 text-pretty">
        {question.prompt}
      </h2>

      <div role="radiogroup" aria-label="Answer choices" className="grid gap-2.5">
        {question.options.map((option, index) => {
          const selected = selectedOptionIdx === index;
          const isCorrect = revealed && correctOptionIdx === index;
          const isWrongPick = revealed && selected && correctOptionIdx !== index;

          return (
            <button
              key={`${question.id}-${index}`}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={submitted}
              onClick={() => onSelect(index)}
              className={cn(
                "flex w-full items-center gap-3.5 rounded-control border px-4.5 py-4 text-left transition-colors duration-150",
                "focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2",
                submitted ? "cursor-default" : "hover:bg-surface-sunken",
                isCorrect
                  ? "border-forest-800 bg-accent/22"
                  : isWrongPick
                    ? "border-ember-500 bg-ember-500/8"
                    : selected
                      ? "border-forest-800 bg-accent/18"
                      : "border-border-subtle bg-white shadow-sm",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold",
                  isCorrect
                    ? "bg-forest-900 text-lime-500"
                    : isWrongPick
                      ? "bg-ember-500 text-cream-100"
                      : selected
                        ? "bg-forest-900 text-lime-500"
                        : "bg-surface-sunken text-forest-900",
                )}
              >
                {LETTERS[index] ?? index + 1}
              </span>
              <span className="min-w-0 flex-1 text-[15px] leading-relaxed text-text-body">
                {option}
              </span>
              {isCorrect ? (
                <Check size={18} className="shrink-0 text-forest-800" />
              ) : isWrongPick ? (
                <X size={18} className="shrink-0 text-ember-600" />
              ) : null}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className="flex gap-3 rounded-control border border-forest-800/10 bg-accent/18 p-4.5 animate-[fade-up-in_200ms_var(--ease-standard)]">
          <Sparkles size={17} className="mt-0.5 shrink-0 text-forest-800" />
          <div className="min-w-0 flex-1 grid gap-1">
            <span className="text-[13px] font-bold text-forest-900">
              {gotItRight ? "Correct" : "Not quite"}
            </span>
            {feedback ? <AiMarkdown content={feedback} compact /> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
