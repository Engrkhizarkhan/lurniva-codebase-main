import type {
  AiResponseStyle,
  Flashcard,
  LearningFeature,
  McqQuestion,
  ShortQuestion,
} from "~/features/day-study/types";

export type { AiResponseStyle };

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** What a study set covers — grounds every generation in the day's real topics. */
export interface DayTopicContext {
  planName: string;
  topics: { topicLabel: string; subtopicLabel: string | null }[];
  /** Human-readable trail, e.g. "Mathematics -> Algebra -> Quadratic Equations". */
  topicPath?: string;
  /**
   * Progressively-disclosed chapter content distilled from the source material
   * (book-to-skill). When present, generations answer from these chapters
   * instead of just the topic labels. Loaded on demand by the grounding layer.
   */
  chapters?: { title: string; topics: string[]; content: string }[];
}

export interface AiChatParams extends DayTopicContext {
  history: AiChatMessage[];
  message: string;
  /** Composer tone: guided (tutor) | exploratory (open) | concise (tldr). */
  mode?: "guided" | "exploratory" | "concise";
  /** How the answer should be shaped — see `AiResponseStyle`. */
  responseStyle?: AiResponseStyle;
  /** LLM to use for this call — falls back to the provider default when unset. */
  model?: string;
}

export interface AiLongFormParams extends DayTopicContext {
  feature: LearningFeature;
  model?: string;
}

export interface AiTopicParams extends DayTopicContext {
  count: number;
  model?: string;
}

/** The structured, rich reply the chat module renders (message + metadata). */
export interface StructuredReply {
  message: string;
  keyPoints: string[];
  followUps: { label: string; prompt: string }[];
  sourceLabel: string | null;
}

/**
 * One frame of a streamed chat turn. The text arrives as `delta`s so the UI can
 * render the answer as it is written; the single closing `reply` carries the
 * same `StructuredReply` the non-streaming call returns, so nothing downstream
 * has to choose between "fast" and "complete".
 */
export type ConversationChunk =
  | { kind: "delta"; text: string }
  | { kind: "reply"; reply: StructuredReply };

/** Server-only: carries the answer key alongside the question shown to the client. */
export interface GeneratedMcq {
  question: McqQuestion;
  correctOptionIdx: number;
  explanation: string;
}

export interface GeneratedShortQuestion {
  question: ShortQuestion;
  modelAnswer: string;
}

export interface GradeShortAnswerParams {
  prompt: string;
  modelAnswer: string;
  responseText: string;
}

export interface GradedAnswer {
  isCorrect: boolean;
  feedback: string;
}

/**
 * Swappable AI backend. `MockAiProvider` (mock-provider.ts) is wired in today;
 * swap `getAiProvider()` in index.ts to call a real RAG/LLM service once its
 * HTTP contract is known — no other code in the app depends on the provider.
 */
export interface AiProvider {
  streamChat(params: AiChatParams): AsyncIterable<string>;
  streamLongForm(params: AiLongFormParams): AsyncIterable<string>;
  generateFlashcards(params: AiTopicParams): Promise<Flashcard[]>;
  generateMcqs(params: AiTopicParams): Promise<GeneratedMcq[]>;
  generateShortQuestions(params: AiTopicParams): Promise<GeneratedShortQuestion[]>;
  gradeShortAnswer(params: GradeShortAnswerParams): Promise<GradedAnswer>;
  /** One rich, grounded chat turn — the shape the chat UI renders natively. */
  completeConversation(params: AiChatParams): Promise<StructuredReply>;
  /** The same turn, streamed: text deltas first, then the structured reply. */
  streamConversation(params: AiChatParams): AsyncIterable<ConversationChunk>;
}
