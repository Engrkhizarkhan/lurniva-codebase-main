import {
  ArrowRight,
  Clock3,
  Gauge,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@lurniva/ui";
import { AI_FEATURE_BY_ID } from "../../constants/features";
import type { AssessmentFeature, CompleteAttemptResponse } from "../../types";

/**
 * One line of the breakdown. Sections come from the attempt the student
 * actually sat — never a topic model we do not have — so every bar here is
 * something they can check against their own answers.
 */
export interface SectionResult {
  label: string;
  correctCount: number;
  totalQuestions: number;
  /** Null for self-graded recall, where "correct" is not a marked outcome. */
  score: number | null;
}

interface AssessmentResultsProps {
  feature: AssessmentFeature;
  result: CompleteAttemptResponse;
  sections: SectionResult[];
  /** Minutes the run was sized for — the session length shown in the chips. */
  minutes: number;
  onRestart: () => void;
  onBackToStudy: () => void;
  /** Takes the student back to the tutor with a question about this attempt. */
  onAskAi?: () => void;
}

function bandOf(score: number): { state: string; ink: string; fill: string } {
  if (score >= 80) {
    return { state: "Strong", ink: "text-forest-700", fill: "bg-forest-800" };
  }
  if (score >= 60) {
    return { state: "Steady", ink: "text-amber-600", fill: "bg-amber-500" };
  }
  return { state: "Needs work", ink: "text-ember-600", fill: "bg-ember-500" };
}

/**
 * The end of an attempt: what the numbers say, where the marks went, and the
 * next thing worth doing. Flashcards are self-graded recall rather than marked
 * answers, so they report what was worked through instead of a percentage.
 */
export function AssessmentResults({
  feature,
  result,
  sections,
  minutes,
  onRestart,
  onBackToStudy,
  onAskAi,
}: AssessmentResultsProps) {
  const meta = AI_FEATURE_BY_ID[feature];
  const score = result.score;
  const hasScore = score !== null;

  const headline = !hasScore
    ? `You worked through ${result.totalQuestions} card${
        result.totalQuestions === 1 ? "" : "s"
      } on this set.`
    : score >= 80
      ? `You have this — ${result.correctCount} of ${result.totalQuestions} correct.`
      : score >= 60
        ? `The fundamentals are there: ${result.correctCount} of ${result.totalQuestions} correct, with a few gaps to close.`
        : `You got ${result.correctCount} of ${result.totalQuestions}. This set is worth another pass before you move on.`;

  const chips: { icon: LucideIcon; label: string }[] = [
    {
      icon: Target,
      label: hasScore
        ? `${result.correctCount} of ${result.totalQuestions} correct`
        : `${result.totalQuestions} card${result.totalQuestions === 1 ? "" : "s"} reviewed`,
    },
    { icon: Clock3, label: `~${minutes} min session` },
    ...(hasScore
      ? [{ icon: Gauge as LucideIcon, label: `Score ${score}%` }]
      : []),
  ];

  const actions: {
    label: string;
    icon: LucideIcon;
    onClick: () => void;
    primary?: boolean;
  }[] = [
    ...(onAskAi
      ? [
          {
            label: "Ask AI about my mistakes",
            icon: Sparkles as LucideIcon,
            onClick: onAskAi,
            primary: true,
          },
        ]
      : []),
    { label: "Practise again", icon: RotateCcw, onClick: onRestart },
    { label: "Back to learning", icon: MessageSquare, onClick: onBackToStudy },
  ];

  return (
    <div className="mx-auto grid max-w-[800px] gap-6 animate-[fade-up-in_var(--dur-modal)_var(--ease-standard)]">
      <div className="grid gap-3.5">
        <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-forest-700">
          <Sparkles size={14} />
          Lurniva AI · {meta.label} review
        </span>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-forest-900 text-pretty">
          {headline}
        </h1>
        <div className="flex flex-wrap gap-2.5">
          {chips.map((chip) => (
            <span
              key={chip.label}
              className="flex items-center gap-1.5 rounded-pill border border-border-subtle bg-white px-3.5 py-1.5 text-[13px] font-semibold tabular-nums text-forest-900"
            >
              <chip.icon size={14} className="text-forest-700" />
              {chip.label}
            </span>
          ))}
        </div>
      </div>

      {sections.length > 0 ? (
        <div className="grid gap-4.5 rounded-2xl border border-border-subtle bg-white p-6 shadow-sm">
          <span className="font-display text-[17px] font-bold text-forest-900">
            {sections.length > 1 ? "Section breakdown" : "How it went"}
          </span>
          <div className="grid gap-3.5">
            {sections.map((section) => {
              const band = section.score === null ? null : bandOf(section.score);
              return (
                <div key={section.label} className="grid gap-1.5">
                  <div className="flex items-center gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-forest-900">
                      {section.label}
                    </span>
                    {band ? (
                      <span className={cn("text-xs font-semibold", band.ink)}>
                        {band.state}
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-text-muted">
                        Self-graded
                      </span>
                    )}
                    <span className="min-w-[52px] text-right text-[13px] tabular-nums text-text-muted">
                      {section.correctCount}/{section.totalQuestions}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-pill bg-surface-sunken">
                    <span
                      className={cn(
                        "block h-full rounded-pill transition-[width] duration-500 ease-standard",
                        band ? band.fill : "bg-forest-300",
                      )}
                      style={{
                        width: `${
                          section.totalQuestions > 0
                            ? Math.round(
                                (section.correctCount / section.totalQuestions) * 100,
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className={cn(
              "flex items-center gap-3 rounded-control border p-4.5 text-left transition-shadow duration-150 hover:shadow-md",
              action.primary
                ? "border-forest-900 bg-forest-900 text-lime-500"
                : "border-border-subtle bg-white text-forest-900 shadow-sm",
            )}
          >
            <action.icon size={18} className="shrink-0" />
            <span className="min-w-0 flex-1 text-sm font-semibold">
              {action.label}
            </span>
            <ArrowRight size={16} className="shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}
