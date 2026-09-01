import type { LucideIcon } from "lucide-react";
import type { PlanItemStatus } from "../plan/types";
import type { AssessmentCounts } from "./lib/assessment-plan";

// ---------------------------------------------------------------------------
// Feature identity
// ---------------------------------------------------------------------------

export type LearningFeature = "summarize" | "revision_notes" | "last_minute_notes";
export type AssessmentFeature = "flashcards" | "mcqs" | "short_questions" | "mock_exam";
export type AiFeature = LearningFeature | AssessmentFeature;
export type AiMode = "learning" | "assessment" | "chat" | "content";

export const LEARNING_FEATURES: LearningFeature[] = [
  "summarize",
  "revision_notes",
  "last_minute_notes",
];

export const ASSESSMENT_FEATURES: AssessmentFeature[] = [
  "flashcards",
  "mcqs",
  "short_questions",
  "mock_exam",
];

// ---------------------------------------------------------------------------
// Day context (bootstrap payload)
// ---------------------------------------------------------------------------

export interface DayStudyTask {
  id: string;
  topicLabel: string;
  subtopicLabel: string | null;
  status: PlanItemStatus;
}

export interface ChatMessageDto {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface LearningContentDto {
  content: string;
  updatedAt: string;
}

export interface DayStudyContext {
  plan: { id: string; name: string };
  user: { name: string | null };
  day: {
    dayNumber: number;
    scheduledDate: string;
    status: PlanItemStatus;
    tasks: DayStudyTask[];
  };
  chat: { sessionId: string | null; messages: ChatMessageDto[] };
  learningContent: Partial<Record<LearningFeature, LearningContentDto>>;
}

// ---------------------------------------------------------------------------
// AI interaction module
// ---------------------------------------------------------------------------

/** The three tones the composer's mode dropdown offers. */
export type AiComposerMode = "guided" | "exploratory" | "concise";

/**
 * How the student wants the answer delivered. Chosen in the composer's
 * response-style selector and sent with the request, so the preference reaches
 * the model rather than only labelling the UI.
 */
export type AiResponseStyle =
  | "summary"
  | "revision_notes"
  | "detailed_guide"
  | "last_minute_notes";

export const AI_RESPONSE_STYLES: AiResponseStyle[] = [
  "summary",
  "revision_notes",
  "detailed_guide",
  "last_minute_notes",
];

/** Where the single chat composer is currently mounted. */
export type ComposerLocation = "main" | "sidebar";

/** A one-tap prompt rendered under an AI response. */
export interface AiFollowUp {
  id: string;
  label: string;
  prompt: string;
}

/** Long-form AI output, opened in the rich-text editor instead of the feed. */
export interface AiDocument {
  id: string;
  title: string;
  /** HTML — the editor's initial content. */
  content: string;
}

/**
 * The RAG response shape. `useAiResponse` mocks it today; the real endpoint
 * must return the same contract so only that hook changes.
 */
export interface AiResponse {
  id: string;
  message: string;
  keyPoints: string[];
  sourceLabel: string | null;
  createdAt: string;
  /** When true the response opens the editor + sidebar instead of the feed. */
  isLong: boolean;
  followUps: AiFollowUp[];
  document?: AiDocument;
}

export interface AiUserMessage {
  id: string;
  content: string;
  createdAt: string;
}

/** One rendered turn in the conversation — discriminated on `kind`. */
export type AiConversationEntry =
  | { kind: "user"; message: AiUserMessage }
  | { kind: "ai"; response: AiResponse };

/** The five brand hues the design tints suggestion/tool icons with. */
export type BrandTone = "forest" | "teal" | "lime" | "ember" | "amber";

/** An empty-state card that pre-fills the composer and sends. */
export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: BrandTone;
  prompt: string;
}

/** A pill under the "Explore more" divider on the empty state. */
export interface AiExplorePill {
  id: string;
  label: string;
  icon: LucideIcon;
  prompt: string;
}

/** A study-note bucket the user can file selected editor text into. */
export interface NoteCategory {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  /** CSS colour the highlight and swatch use. */
  color: string;
}

/** Text lifted out of the editor and filed under a category. */
export interface StudyNote {
  id: string;
  text: string;
  categoryId: string;
  /** Where the note was taken from, e.g. "Physics · Day 3" — display only. */
  sourceLabel: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Assessment content
// ---------------------------------------------------------------------------

export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

export interface McqQuestion {
  id: string;
  prompt: string;
  options: string[];
}

export interface ShortQuestion {
  id: string;
  prompt: string;
}

export interface GenerateAssessmentResponse {
  attemptId: string;
  feature: AssessmentFeature;
  /** The sizes actually generated, after server-side clamping. */
  counts: AssessmentCounts;
  totalQuestions: number;
  durationMinutes: number;
  flashcards?: Flashcard[];
  mcqs?: McqQuestion[];
  shortQuestions?: ShortQuestion[];
}

export type AssessmentAnswerKind = "mcq" | "short" | "flashcard";

export interface SubmitAnswerRequest {
  questionId: string;
  kind: AssessmentAnswerKind;
  selectedOptionIdx?: number;
  responseText?: string;
  flashcardResult?: "known" | "review";
}

export interface SubmitAnswerResponse {
  isCorrect: boolean | null;
  feedback: string | null;
  correctAnswer: string | null;
}

export interface CompleteAttemptResponse {
  score: number | null;
  totalQuestions: number;
  correctCount: number;
}
