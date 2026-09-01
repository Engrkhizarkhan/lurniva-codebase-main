import { prisma } from "@lurniva/db";
import type { AiSession, Prisma } from "@lurniva/db";
import type { AssessmentCounts } from "../../day-study/lib/assessment-plan";
import type {
  AiResponseStyle,
  AssessmentFeature,
  ChatMessageDto,
} from "../../day-study/types";
import type {
  AiStudySessionDetail,
  AiStudySessionSummary,
  StudyContextRef,
  StudyContextSummary,
  StudyMode,
} from "../types";
import { resolveStudyContext } from "./study-context";

/**
 * Persistence for the standalone AI Study workspace.
 *
 * These sessions reuse `AiSession` but carry no `planDayId`; they are
 * identified by `mode = "ai_study"`. Everything the workspace configures — the
 * selected topic, the response style, the study mode and the assessment setup
 * — lives in the row's `metadata`, following the same JSON-metadata convention
 * the day-level content sessions already use.
 */

export const AI_STUDY_MODE = "ai_study";
const AI_STUDY_FEATURE = "chat";
const DEFAULT_TITLE = "New session";
const TITLE_MAX = 60;

export class AiStudySessionNotFoundError extends Error {
  constructor() {
    super("Session not found");
  }
}

/** The shape stored in `AiSession.metadata` for an AI Study session. */
interface AiStudyMetadata {
  context: StudyContextRef;
  contextPath: string[];
  contextSourceLabel: string | null;
  responseStyle: AiResponseStyle | null;
  studyMode: StudyMode;
  assessmentFeature: AssessmentFeature | null;
  assessmentCounts: AssessmentCounts | null;
}

type SessionWithCount = AiSession & { _count: { messages: number } };

function readMetadata(session: AiSession): AiStudyMetadata {
  const raw = (session.metadata ?? {}) as Partial<AiStudyMetadata>;
  return {
    context: raw.context ?? { kind: "general" },
    contextPath: Array.isArray(raw.contextPath) ? raw.contextPath : ["General study"],
    contextSourceLabel: raw.contextSourceLabel ?? null,
    responseStyle: raw.responseStyle ?? null,
    studyMode: raw.studyMode ?? "learning",
    assessmentFeature: raw.assessmentFeature ?? null,
    assessmentCounts: raw.assessmentCounts ?? null,
  };
}

function contextSummaryOf(metadata: AiStudyMetadata): StudyContextSummary {
  const path = metadata.contextPath;
  return {
    ref: metadata.context,
    path,
    label: path[path.length - 1] ?? "General study",
    sourceLabel: metadata.contextSourceLabel,
  };
}

function toSummary(session: SessionWithCount): AiStudySessionSummary {
  const metadata = readMetadata(session);
  return {
    id: session.id.toString(),
    title: session.title ?? DEFAULT_TITLE,
    studyMode: metadata.studyMode,
    responseStyle: metadata.responseStyle,
    assessmentFeature: metadata.assessmentFeature,
    context: contextSummaryOf(metadata),
    messageCount: session._count.messages,
    lastActivityAt: (session.lastMessageAt ?? session.createdAt).toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}

function toMessageDto(message: {
  id: bigint;
  role: string;
  content: string;
  createdAt: Date;
}): ChatMessageDto {
  return {
    id: message.id.toString(),
    role: message.role as "user" | "assistant",
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  };
}

function asBigInt(sessionId: string): bigint {
  try {
    return BigInt(sessionId);
  } catch {
    throw new AiStudySessionNotFoundError();
  }
}

/** Loads a session the user owns, or throws — every mutation starts here. */
export async function findOwnedAiStudySession(
  userId: string,
  sessionId: string,
): Promise<AiSession> {
  const session = await prisma.aiSession.findFirst({
    where: { id: asBigInt(sessionId), userId, mode: AI_STUDY_MODE },
  });
  if (!session) throw new AiStudySessionNotFoundError();
  return session;
}

export async function listAiStudySessions(
  userId: string,
): Promise<AiStudySessionSummary[]> {
  const sessions = await prisma.aiSession.findMany({
    where: { userId, mode: AI_STUDY_MODE },
    orderBy: [{ lastMessageAt: "desc" }, { createdAt: "desc" }],
    take: 100,
    include: { _count: { select: { messages: true } } },
  });
  return sessions.map(toSummary);
}

export interface CreateAiStudySessionInput {
  context: StudyContextRef;
  responseStyle: AiResponseStyle | null;
  studyMode: StudyMode;
  title?: string;
}

export async function createAiStudySession(
  userId: string,
  input: CreateAiStudySessionInput,
): Promise<AiStudySessionSummary> {
  // Resolving up front both validates the ref against the user's own material
  // and gives us the breadcrumb labels to store alongside it.
  const resolved = await resolveStudyContext(userId, input.context, "");

  const metadata: AiStudyMetadata = {
    context: resolved.summary.ref,
    contextPath: resolved.summary.path,
    contextSourceLabel: resolved.summary.sourceLabel,
    responseStyle: input.responseStyle,
    studyMode: input.studyMode,
    assessmentFeature: null,
    assessmentCounts: null,
  };

  const session = await prisma.aiSession.create({
    data: {
      userId,
      planDayId: null,
      mode: AI_STUDY_MODE,
      feature: AI_STUDY_FEATURE,
      title: input.title?.trim() || DEFAULT_TITLE,
      metadata: metadata as unknown as Prisma.InputJsonValue,
    },
    include: { _count: { select: { messages: true } } },
  });

  return toSummary(session);
}

export async function getAiStudySession(
  userId: string,
  sessionId: string,
): Promise<AiStudySessionDetail> {
  const session = await prisma.aiSession.findFirst({
    where: { id: asBigInt(sessionId), userId, mode: AI_STUDY_MODE },
    include: {
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!session) throw new AiStudySessionNotFoundError();

  const metadata = readMetadata(session);
  return {
    ...toSummary(session),
    assessmentCounts: metadata.assessmentCounts,
    messages: session.messages.map(toMessageDto),
  };
}

export interface UpdateAiStudySessionInput {
  title?: string;
  responseStyle?: AiResponseStyle | null;
  studyMode?: StudyMode;
  context?: StudyContextRef;
  assessmentFeature?: AssessmentFeature | null;
  assessmentCounts?: AssessmentCounts | null;
}

/**
 * Patches a session's configuration. Changing the topic re-resolves it so the
 * stored breadcrumb can never drift from the ref it describes.
 */
export async function updateAiStudySession(
  userId: string,
  sessionId: string,
  input: UpdateAiStudySessionInput,
): Promise<AiStudySessionSummary> {
  const session = await findOwnedAiStudySession(userId, sessionId);
  const metadata = readMetadata(session);

  if (input.context) {
    const resolved = await resolveStudyContext(userId, input.context, "");
    metadata.context = resolved.summary.ref;
    metadata.contextPath = resolved.summary.path;
    metadata.contextSourceLabel = resolved.summary.sourceLabel;
  }
  if (input.responseStyle !== undefined) metadata.responseStyle = input.responseStyle;
  if (input.studyMode) metadata.studyMode = input.studyMode;
  if (input.assessmentFeature !== undefined) {
    metadata.assessmentFeature = input.assessmentFeature;
  }
  if (input.assessmentCounts !== undefined) {
    metadata.assessmentCounts = input.assessmentCounts;
  }

  const updated = await prisma.aiSession.update({
    where: { id: session.id },
    data: {
      ...(input.title !== undefined
        ? { title: input.title.trim().slice(0, TITLE_MAX) || DEFAULT_TITLE }
        : {}),
      metadata: metadata as unknown as Prisma.InputJsonValue,
    },
    include: { _count: { select: { messages: true } } },
  });

  return toSummary(updated);
}

export async function deleteAiStudySession(
  userId: string,
  sessionId: string,
): Promise<boolean> {
  const result = await prisma.aiSession.deleteMany({
    where: { id: asBigInt(sessionId), userId, mode: AI_STUDY_MODE },
  });
  return result.count > 0;
}

/**
 * Names an untitled session after its first question, the way the history list
 * expects to identify it. A session the user has already renamed is left alone.
 */
export async function ensureSessionTitle(
  session: AiSession,
  firstMessage: string,
): Promise<void> {
  if (session.title && session.title !== DEFAULT_TITLE) return;
  const title = firstMessage.trim().replace(/\s+/g, " ").slice(0, TITLE_MAX);
  if (!title) return;
  await prisma.aiSession.update({
    where: { id: session.id },
    data: { title },
  });
}

/** Reads the stored config for a session — used by respond/assessment. */
export function readSessionConfig(session: AiSession): AiStudyMetadata {
  return readMetadata(session);
}
