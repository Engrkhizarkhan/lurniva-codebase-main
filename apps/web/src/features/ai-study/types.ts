import type {
  AiResponseStyle,
  AssessmentFeature,
  ChatMessageDto,
} from "../day-study/types";
import type { AssessmentCounts } from "../day-study/lib/assessment-plan";

/**
 * The standalone AI Study workspace. Unlike the per-day study page, a session
 * here is not anchored to a plan day: it carries its own topic context and
 * response style, and a user can keep as many as they like.
 */

/** Learning is conversational study; assessment generates and grades questions. */
export type StudyMode = "learning" | "assessment";

/** Where the AI's grounding comes from for a session. */
export type StudyContextKind = "catalog" | "library" | "plan_day" | "general";

/**
 * A pointer to the selected study material. Stored on the session so the
 * context survives reloads and is re-resolved server-side on every turn —
 * never trusted from, or held only in, the client.
 */
export interface StudyContextRef {
  kind: StudyContextKind;
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  libraryItemId?: string;
  chapterId?: string;
  planId?: string;
  dayNumber?: number;
}

/** The resolved, display-ready form of a `StudyContextRef`. */
export interface StudyContextSummary {
  ref: StudyContextRef;
  /** Breadcrumb trail, e.g. ["Mathematics", "Algebra", "Quadratic Equations"]. */
  path: string[];
  /** The deepest segment — what the header shows when space is tight. */
  label: string;
  /** Where the grounding came from, e.g. "Library · Physics Notes". */
  sourceLabel: string | null;
}

export interface AiStudySessionSummary {
  id: string;
  title: string;
  studyMode: StudyMode;
  /** `null` until the student picks one — the composer shows a placeholder. */
  responseStyle: AiResponseStyle | null;
  assessmentFeature: AssessmentFeature | null;
  context: StudyContextSummary;
  messageCount: number;
  lastActivityAt: string;
  createdAt: string;
}

export interface AiStudySessionDetail extends AiStudySessionSummary {
  messages: ChatMessageDto[];
  assessmentCounts: AssessmentCounts | null;
}

// ---------------------------------------------------------------------------
// Topic picker sources
// ---------------------------------------------------------------------------

export interface StudySourceSubtopic {
  id: string;
  label: string;
}

export interface StudySourceTopic {
  id: string;
  label: string;
  subtopics: StudySourceSubtopic[];
}

export interface StudySourceSubject {
  id: string;
  label: string;
  topics: StudySourceTopic[];
}

export interface StudySourceLibraryItem {
  id: string;
  title: string;
  scope: string;
  chapters: { id: string; title: string }[];
}

export interface StudySourcePlanDay {
  dayNumber: number;
  label: string;
}

export interface StudySourcePlan {
  id: string;
  name: string;
  days: StudySourcePlanDay[];
}

/** Everything the topic picker needs, in one request. */
export interface StudySources {
  subjects: StudySourceSubject[];
  library: StudySourceLibraryItem[];
  plans: StudySourcePlan[];
}
