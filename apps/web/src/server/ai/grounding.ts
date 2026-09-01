import { prisma } from "@lurniva/db";
import type { DayTopicContext } from "./ai-provider";

/**
 * Book-to-skill grounding for the web app.
 *
 * Source material (user-pasted text, uploaded PDF/Word/txt, or library
 * content) is distilled into a `SkillDoc` by the model service and stored in
 * the day's content `AiSession.metadata`. This module loads those chapters on
 * demand and routes a given question/feature to the best-matching chapters
 * (progressive disclosure) so the provider is grounded in real content instead
 * of topic labels alone.
 */

export interface SkillChapterLike {
  id?: string;
  title: string;
  topics: string[];
  content: string;
}

export interface SkillDocLike {
  id?: string;
  title: string;
  sourceType?: string;
  overview?: string;
  chapters: SkillChapterLike[];
}

/** Where the distilled skill lives for a day: content session metadata shape. */
export interface DayContentRecord {
  title: string;
  sourceText: string;
  skill: SkillDocLike;
  attachedAt: string;
}

export const CONTENT_SESSION_MODE = "content";
export const CONTENT_SESSION_FEATURE = "source";

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length > 3),
  );
}

function chapterScore(chapter: SkillChapterLike, query: string): number {
  const q = tokenize(query);
  const corpus = tokenize(
    `${chapter.title} ${chapter.topics.join(" ")} ${chapter.content.slice(0, 1200)}`,
  );
  let score = 0;
  const title = chapter.title.toLowerCase();
  for (const word of q) {
    if (corpus.has(word)) score += 1;
    if (title.includes(word)) score += 2;
  }
  return score;
}

/** Ranks chapters by how well they match a question; empty query keeps the first N. */
export function routeChapters(
  skill: SkillDocLike,
  query: string,
  limit = 2,
): SkillChapterLike[] {
  const ranked = [...skill.chapters].sort(
    (a, b) => chapterScore(b, query) - chapterScore(a, query),
  );
  const matched = ranked.filter((chapter) => chapterScore(chapter, query) > 0);
  return (matched.length > 0 ? matched : ranked).slice(0, limit);
}

/** Loads the distilled skill a user attached to a day, if any. */
export async function loadDayContent(
  userId: string,
  planDayId: bigint,
): Promise<DayContentRecord | null> {
  const session = await prisma.aiSession.findUnique({
    where: {
      planDayId_mode_feature: {
        planDayId,
        mode: CONTENT_SESSION_MODE,
        feature: CONTENT_SESSION_FEATURE,
      },
    },
    select: { metadata: true },
  });
  if (!session) return null;
  const record = session.metadata as Partial<DayContentRecord> | null;
  if (!record?.skill || !Array.isArray(record.skill.chapters)) return null;
  return record as DayContentRecord;
}

/**
 * Builds the provider context for a study action. When distilled content is
 * attached the top matching chapters are injected; otherwise the context is the
 * same topic-label context as today.
 */
export async function buildGroundedContext(params: {
  userId: string;
  planDayId: bigint;
  planName: string;
  topics: DayTopicContext["topics"];
  /** The student's question or the feature label — used to route chapters. */
  query: string;
  chapterLimit?: number;
}): Promise<DayTopicContext> {
  const { userId, planDayId, planName, topics, query, chapterLimit = 2 } = params;
  const content = await loadDayContent(userId, planDayId);

  const base: DayTopicContext = { planName, topics };

  if (!content) return base;

  const chapters = routeChapters(content.skill, query, chapterLimit).map(
    (chapter) => ({
      title: chapter.title,
      topics: Array.isArray(chapter.topics) ? chapter.topics : [],
      content: chapter.content ?? "",
    }),
  );

  return chapters.length > 0 ? { ...base, chapters } : base;
}