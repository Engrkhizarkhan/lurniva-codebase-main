/** Shared domain types for the model service — mirrors the book-to-skill
 *  "structurize a document, load chapters on demand" methodology. */

export type TimelineMode = "auto" | "manual";
export type StudyMode =
  | "summarize"
  | "revision_notes"
  | "last_minute_notes"
  | "flashcards"
  | "mcqs"
  | "short_questions"
  | "mock_exam";

export type AssessmentKind =
  "flashcards" | "mcqs" | "short_questions" | "mock_exam";

/** One on-demand chapter distilled from the source content. */
export interface SkillChapter {
  id: string;
  title: string;
  /** Synthesised, dense markdown — a "chapter file", loaded on demand. */
  content: string;
  /** Topics this chapter covers, used for routing queries to the right chapter. */
  topics: string[];
}

/** A named, extracted element from the source (book-to-skill "patterns"). */
export interface SkillPattern {
  name: string;
  kind: "framework" | "principle" | "technique" | "anti-pattern";
  description: string;
}

/** A glossary term with pointers back to the chapters that use it. */
export interface GlossaryEntry {
  term: string;
  definition: string;
  chapterIds: string[];
}

/** The fully-distilled, structured representation of a user's content. */
export interface SkillDoc {
  id: string;
  title: string;
  sourceType: string;
  /** High-signal overview + topic index (the "SKILL.md" role). */
  overview: string;
  chapters: SkillChapter[];
  patterns: SkillPattern[];
  glossary: GlossaryEntry[];
  cheatsheet: string;
  createdAt: string;
}

/** A scheduled block on a timeline. */
export interface PlanDay {
  dayNumber: number;
  title: string;
  chapterId: string | null;
  chapters: string[];
  label: string;
  durationMinutes: number;
}

/** The generated learning plan — respects the user's timeline selection. */
export interface LearningPlan {
  id: string;
  skillId: string;
  title: string;
  timeline: TimelineMode;
  daysPerWeek: number;
  hoursPerDay: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  days: PlanDay[];
}

/** Assessment set generated from one or more chapters. */
export interface GeneratedAssessment {
  id: string;
  skillId: string;
  kind: AssessmentKind;
  chapters: string[];
  questions: AssessmentQuestion[];
  explanation: string;
}

export interface AssessmentQuestion {
  id: string;
  kind: AssessmentKind;
  prompt: string;
  options?: string[];
  /** Only present server-side; stripped before sending to the client for mcq/mock. */
  correctIndex?: number;
  modelAnswer?: string;
}

/** Payload for creating a skill from raw content. */
export interface StructureSkillInput {
  title?: string;
  /** The content the platform / user provides — markdown or plain text. */
  content: string;
}

/** Payload for building a learning plan from a distilled skill. */
export interface BuildPlanInput {
  timeline: TimelineMode;
  startDate?: string;
  hoursPerDay?: number;
  daysPerWeek?: number;
  totalDays?: number;
  /** Manual timeline: how to split the chapters across explicit day slots. */
  manualDays?: ManualDayInput[];
}

export interface ManualDayInput {
  title?: string;
  chapters: string[];
}

export interface QuerySkillInput {
  question: string;
  history?: { role: "user" | "assistant"; content: string }[];
}
