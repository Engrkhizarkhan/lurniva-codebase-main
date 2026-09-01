import { useEffect, useMemo, useState } from "react";
import { AlertCircle } from "lucide-react";
import {
  useCompleteAssessmentAttempt,
  useSubmitAssessmentAnswer,
} from "../../hooks/useAiAssessment";
import { AI_FEATURE_BY_ID } from "../../constants/features";
import { estimateMinutes } from "../../lib/assessment-plan";
import type {
  CompleteAttemptResponse,
  Flashcard,
  GenerateAssessmentResponse,
  McqQuestion,
  ShortQuestion,
} from "../../types";
import { AssessmentResults } from "./assessment-results";
import type { SectionResult } from "./assessment-results";
import { AssessmentRunner } from "./assessment-runner";
import { FlashcardQuestionView } from "./flashcard-question";
import { McqQuestionView } from "./mcq-question";
import { ShortQuestionView } from "./short-question";

interface AssessmentSessionProps {
  assessment: GenerateAssessmentResponse;
  /** Names the study set in the runner. */
  title: string;
  onExit: () => void;
  onRestart: () => void;
  /** Offered on the results screen when the caller can open the tutor. */
  onAskAi?: (summary: string) => void;
  /**
   * Fired once the attempt is scored. Lets a caller that presented the sitting
   * full-screen hand the page back — results are a normal screen, not a modal.
   */
  onCompleted?: () => void;
}

type RunnerQuestion =
  | { kind: "mcq"; id: string; section: string; question: McqQuestion }
  | { kind: "short"; id: string; section: string; question: ShortQuestion }
  | { kind: "flashcard"; id: string; section: string; card: Flashcard };

interface AnswerState {
  submitted: boolean;
  revealed: boolean;
  selectedOptionIdx: number | null;
  text: string;
  flashcardResult: "known" | "review" | null;
  isCorrect: boolean | null;
  feedback: string | null;
  correctAnswer: string | null;
}

const EMPTY_ANSWER: AnswerState = {
  submitted: false,
  revealed: false,
  selectedOptionIdx: null,
  text: "",
  flashcardResult: null,
  isCorrect: null,
  feedback: null,
  correctAnswer: null,
};

/**
 * Runs one generated assessment to completion.
 *
 * All four types share this orchestration — the queue, the per-question answer
 * state, submission and scoring — and differ only in which view renders the
 * current question. A mock exam is therefore the same machine with a queue
 * built from all three kinds, not a fourth implementation.
 *
 * Following the day-study store's note, this state is local: an attempt in
 * progress does not need to be shared or to survive navigating away.
 */
export function AssessmentSession({
  assessment,
  title,
  onExit,
  onRestart,
  onAskAi,
  onCompleted,
}: AssessmentSessionProps) {
  const isMock = assessment.feature === "mock_exam";
  const meta = AI_FEATURE_BY_ID[assessment.feature];

  // A mock exam is sat like an exam: marks come at the end, not per question.
  const revealPerQuestion = !isMock;

  const questions = useMemo<RunnerQuestion[]>(() => {
    const mcqs = (assessment.mcqs ?? []).map<RunnerQuestion>((question) => ({
      kind: "mcq",
      id: question.id,
      section: isMock ? "Section 1 · MCQs" : "Multiple choice",
      question,
    }));
    const shortQuestions = (assessment.shortQuestions ?? []).map<RunnerQuestion>(
      (question) => ({
        kind: "short",
        id: question.id,
        section: isMock ? "Section 2 · Short questions" : "Short answer",
        question,
      }),
    );
    const flashcards = (assessment.flashcards ?? []).map<RunnerQuestion>((card) => ({
      kind: "flashcard",
      id: card.id,
      section: isMock ? "Section 3 · Flashcards" : "Flashcard",
      card,
    }));
    return [...mcqs, ...shortQuestions, ...flashcards];
  }, [assessment, isMock]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [completion, setCompletion] = useState<CompleteAttemptResponse | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(
    isMock ? assessment.durationMinutes * 60 : null,
  );

  const submitAnswer = useSubmitAssessmentAnswer(assessment.attemptId);
  const completeAttempt = useCompleteAssessmentAttempt(assessment.attemptId);

  useEffect(() => {
    if (secondsRemaining === null) return;
    if (secondsRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setSecondsRemaining((current) =>
        current === null ? null : Math.max(0, current - 1),
      );
    }, 1000);
    return () => window.clearInterval(timer);
  }, [secondsRemaining]);

  const current = questions[index];
  const answer = current ? (answers[current.id] ?? EMPTY_ANSWER) : EMPTY_ANSWER;
  const isLast = index === questions.length - 1;

  function patchAnswer(id: string, patch: Partial<AnswerState>) {
    setAnswers((current) => ({
      ...current,
      [id]: { ...EMPTY_ANSWER, ...current[id], ...patch },
    }));
  }

  async function submitCurrent(overrides?: Partial<AnswerState>) {
    if (!current) return;
    const state = { ...EMPTY_ANSWER, ...answers[current.id], ...overrides };
    if (state.submitted) return;

    // Mark submitted up front so a double-click can't record the answer twice.
    patchAnswer(current.id, { ...overrides, submitted: true });

    try {
      const result = await submitAnswer.mutateAsync({
        questionId: current.id,
        kind: current.kind,
        ...(current.kind === "mcq"
          ? { selectedOptionIdx: state.selectedOptionIdx ?? undefined }
          : {}),
        ...(current.kind === "short" ? { responseText: state.text } : {}),
        ...(current.kind === "flashcard"
          ? { flashcardResult: state.flashcardResult ?? "review" }
          : {}),
      });
      patchAnswer(current.id, {
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        correctAnswer: result.correctAnswer,
      });
    } catch {
      patchAnswer(current.id, { submitted: false });
    }
  }

  async function finish() {
    const result = await completeAttempt.mutateAsync();
    setCompletion(result);
    onCompleted?.();
  }

  /**
   * Marks per section, read back off the answers actually given. Flashcards
   * are self-graded, so their section reports recall rather than a score.
   */
  function sectionResults(): SectionResult[] {
    const order: string[] = [];
    const byLabel = new Map<string, SectionResult & { graded: boolean }>();

    for (const question of questions) {
      let row = byLabel.get(question.section);
      if (!row) {
        row = {
          label: question.section,
          correctCount: 0,
          totalQuestions: 0,
          score: 0,
          graded: question.kind !== "flashcard",
        };
        byLabel.set(question.section, row);
        order.push(question.section);
      }
      row.totalQuestions += 1;
      const state = answers[question.id];
      if (question.kind === "flashcard") {
        if (state?.flashcardResult === "known") row.correctCount += 1;
      } else if (state?.isCorrect) {
        row.correctCount += 1;
      }
    }

    return order.map((label) => {
      const row = byLabel.get(label)!;
      return {
        label: row.label,
        correctCount: row.correctCount,
        totalQuestions: row.totalQuestions,
        score: row.graded
          ? Math.round((row.correctCount / Math.max(1, row.totalQuestions)) * 100)
          : null,
      };
    });
  }

  if (completion) {
    return (
      <AssessmentResults
        feature={assessment.feature}
        result={completion}
        sections={sectionResults()}
        minutes={estimateMinutes(assessment.counts)}
        onRestart={onRestart}
        onBackToStudy={onExit}
        onAskAi={
          onAskAi
            ? () =>
                onAskAi(
                  `I just finished a ${meta.label.toLowerCase()} run on ${title} and scored ` +
                    `${completion.correctCount} out of ${completion.totalQuestions}. ` +
                    `Which parts should I go over again, and why?`,
                )
            : undefined
        }
      />
    );
  }

  if (!current) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border-subtle bg-white p-8 text-center">
        <p className="text-sm font-semibold text-text-heading">
          No questions were generated
        </p>
        <p className="mt-1 text-sm text-text-muted">
          The topic may not have enough material yet. Try a different topic or a
          smaller set.
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="mt-4 text-sm font-semibold text-text-link hover:text-text-link-hover"
        >
          Change the setup
        </button>
      </div>
    );
  }

  const correctOptionIdx =
    revealPerQuestion && answer.correctAnswer !== null
      ? Number(answer.correctAnswer)
      : null;

  // Takes the question explicitly: narrowing from the `!current` guard above
  // does not survive into a nested function.
  function primaryFor(question: RunnerQuestion): {
    label: string;
    hint: string;
    disabled: boolean;
    action: () => void;
  } {
    if (!answer.submitted) {
      if (question.kind === "mcq") {
        return {
          label: submitAnswer.isPending ? "Checking…" : "Check answer",
          hint:
            answer.selectedOptionIdx === null
              ? "Select an answer to continue"
              : "One answer selected",
          disabled: answer.selectedOptionIdx === null || submitAnswer.isPending,
          action: () => void submitCurrent(),
        };
      }
      if (question.kind === "short") {
        return {
          label: submitAnswer.isPending ? "Marking…" : "Submit answer",
          hint:
            answer.text.trim().length === 0
              ? "Write an answer to continue"
              : "Lurniva marks this against the source material",
          disabled: answer.text.trim().length === 0 || submitAnswer.isPending,
          action: () => void submitCurrent(),
        };
      }
      return {
        label: "Grade yourself",
        hint: answer.revealed
          ? "Grade your recall to continue"
          : "Reveal the answer, then grade your recall",
        disabled: true,
        action: () => undefined,
      };
    }

    if (isLast) {
      return {
        label: completeAttempt.isPending ? "Scoring…" : "See AI results",
        hint: "Lurniva is tracking which concepts you miss.",
        disabled: completeAttempt.isPending,
        action: () => void finish(),
      };
    }
    return {
      label: "Next question",
      hint: "Lurniva is tracking which concepts you miss.",
      disabled: false,
      action: () => setIndex((value) => value + 1),
    };
  }

  const primary = primaryFor(current);
  const errorMessage =
    submitAnswer.error?.message ?? completeAttempt.error?.message ?? null;

  return (
    <AssessmentRunner
      // The header already names the section, so the eyebrow names the topic.
      title={title}
      sectionLabel={current.section}
      questionIndex={index}
      questionCount={questions.length}
      secondsRemaining={secondsRemaining}
      canGoPrevious={index > 0}
      hint={primary.hint}
      primaryLabel={primary.label}
      primaryDisabled={primary.disabled}
      onPrevious={() => setIndex((value) => Math.max(0, value - 1))}
      onPrimary={primary.action}
      onExit={onExit}
    >
      {current.kind === "mcq" ? (
        <McqQuestionView
          question={current.question}
          selectedOptionIdx={answer.selectedOptionIdx}
          correctOptionIdx={correctOptionIdx}
          feedback={revealPerQuestion ? answer.feedback : null}
          submitted={answer.submitted}
          onSelect={(optionIdx) =>
            patchAnswer(current.id, { selectedOptionIdx: optionIdx })
          }
        />
      ) : current.kind === "short" ? (
        <ShortQuestionView
          question={current.question}
          value={answer.text}
          submitted={answer.submitted}
          isGrading={submitAnswer.isPending}
          isCorrect={revealPerQuestion ? answer.isCorrect : null}
          feedback={revealPerQuestion ? answer.feedback : null}
          modelAnswer={revealPerQuestion ? answer.correctAnswer : null}
          onChange={(text) => patchAnswer(current.id, { text })}
        />
      ) : (
        <FlashcardQuestionView
          card={current.card}
          revealed={answer.revealed}
          result={answer.flashcardResult}
          onReveal={() => patchAnswer(current.id, { revealed: true })}
          onHide={() => patchAnswer(current.id, { revealed: false })}
          onGrade={(result) =>
            void submitCurrent({ flashcardResult: result, revealed: true })
          }
        />
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
    </AssessmentRunner>
  );
}
