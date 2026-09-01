import { Eye, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { cn } from "@lurniva/ui";
import type { Flashcard } from "../../types";

interface FlashcardQuestionViewProps {
  card: Flashcard;
  revealed: boolean;
  /** Recorded once the student has graded their own recall. */
  result: "known" | "review" | null;
  onReveal: () => void;
  onHide: () => void;
  onGrade: (result: "known" | "review") => void;
}

/**
 * One flashcard. Recall comes first: the answer is hidden until the student
 * asks for it, and only then can they grade themselves — which is the signal
 * the attempt actually scores.
 */
export function FlashcardQuestionView({
  card,
  revealed,
  result,
  onReveal,
  onHide,
  onGrade,
}: FlashcardQuestionViewProps) {
  return (
    <div className="grid gap-4">
      <div
        className={cn(
          "grid min-h-56 content-center justify-items-center gap-4 rounded-2xl border p-6 text-center transition-colors duration-200",
          revealed
            ? "border-border-default bg-white"
            : "border-border-subtle bg-surface-subtle",
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-faint">
          {revealed ? "Answer" : "Recall"}
        </p>
        <p className="max-w-prose font-display text-2xl font-bold leading-snug tracking-[-0.01em] text-forest-900 text-pretty">
          {card.front}
        </p>

        {revealed ? (
          <p className="max-w-prose border-t border-border-subtle pt-4 text-base leading-relaxed text-text-body">
            {card.back}
          </p>
        ) : (
          <button
            type="button"
            onClick={onReveal}
            className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2.5 text-sm font-semibold text-text-on-primary transition-colors duration-150 hover:bg-primary-hover"
          >
            <Eye size={15} />
            Reveal answer
          </button>
        )}
      </div>

      {revealed ? (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onGrade("review")}
            aria-pressed={result === "review"}
            className={cn(
              "inline-flex items-center gap-2 rounded-control border px-4 py-2.5 text-sm font-semibold transition-colors duration-150",
              result === "review"
                ? "border-warning bg-warning-soft text-text-heading"
                : "border-border-default bg-white text-text-body hover:bg-surface-sunken",
            )}
          >
            <ThumbsDown size={15} />
            Needs review
          </button>
          <button
            type="button"
            onClick={() => onGrade("known")}
            aria-pressed={result === "known"}
            className={cn(
              "inline-flex items-center gap-2 rounded-control border px-4 py-2.5 text-sm font-semibold transition-colors duration-150",
              result === "known"
                ? "border-success bg-success-soft text-text-heading"
                : "border-border-default bg-white text-text-body hover:bg-surface-sunken",
            )}
          >
            <ThumbsUp size={15} />
            I knew it
          </button>
          <button
            type="button"
            onClick={onHide}
            className="inline-flex items-center gap-1.5 rounded-control px-3 py-2.5 text-sm font-medium text-text-muted hover:text-text-body"
          >
            <RotateCcw size={14} />
            Hide again
          </button>
        </div>
      ) : null}
    </div>
  );
}
