import { prisma, type Prisma } from "@lurniva/db";
import type { DayTopicContext } from "~/server/ai";
import { loadPlanLibrarySkills } from "../../library/services/library-items";
import { buildGroundedContext, routeChapters } from "~/server/ai/grounding";
import type { SkillDocLike } from "~/server/ai/grounding";

export class DayNotFoundError extends Error {
  constructor() {
    super("Day not found");
  }
}

const planDayInclude = {
  plan: { select: { name: true, draftSnapshot: true } },
  tasks: {
    include: { topic: true, subtopic: true, libraryItem: true },
    orderBy: { orderIndex: "asc" as const },
  },
} satisfies Prisma.PlanDayInclude;

export type PlanDayWithContext = Prisma.PlanDayGetPayload<{
  include: typeof planDayInclude;
}>;

/** Resolves a (planId, dayNumber) pair to its `PlanDay` row, scoped to an already-owned plan. */
export async function findPlanDay(
  planDbId: bigint,
  dayNumber: number,
): Promise<PlanDayWithContext> {
  const day = await prisma.planDay.findUnique({
    where: { planId_dayNumber: { planId: planDbId, dayNumber } },
    include: planDayInclude,
  });
  if (!day) throw new DayNotFoundError();
  return day;
}

/** Grounds AI generations in the day's real topics/subtopics. */
export function buildTopicContext(day: PlanDayWithContext): DayTopicContext {
  return {
    planName: day.plan.name,
    topics: day.tasks.map((task) => ({
      topicLabel: task.title ?? task.topic?.name ?? "Untitled",
      subtopicLabel: task.subtopic?.name ?? null,
    })),
  };
}

/**
 * The chapters explicitly scheduled onto this day (Step 4 of the plan
 * wizard) — a task carrying `libraryItemId` + `chapterId`. Deterministic,
 * unlike the query-routed fallback below: this is what the user (or the
 * default auto-placement) actually put on this day.
 */
function loadAssignedChapterContent(
  day: PlanDayWithContext,
): NonNullable<DayTopicContext["chapters"]> {
  const chapters: NonNullable<DayTopicContext["chapters"]> = [];
  for (const task of day.tasks) {
    if (!task.libraryItem || !task.chapterId) continue;
    const skill = task.libraryItem.skill as SkillDocLike | null;
    const skillChapters = Array.isArray(skill?.chapters) ? skill.chapters : [];
    const chapter = skillChapters.find(
      (candidate) => (candidate.id ?? candidate.title) === task.chapterId,
    );
    if (!chapter) continue;
    chapters.push({
      title: chapter.title,
      topics: Array.isArray(chapter.topics) ? chapter.topics : [],
      content: chapter.content ?? "",
    });
  }
  return chapters;
}

/**
 * Top matching chapters across the library items the plan selected. Progressive
 * disclosure like the per-day content, but plan-scoped: each ready resource
 * contributes its best-matching single chapter.
 */
async function loadPlanLibraryChapters(
  userId: string,
  day: PlanDayWithContext,
  query: string,
  limit: number,
): Promise<NonNullable<DayTopicContext["chapters"]>> {
  const skills = await loadPlanLibrarySkills(userId, day.plan.draftSnapshot);
  const chapters: NonNullable<DayTopicContext["chapters"]> = [];
  for (const skill of skills) {
    const [chapter] = routeChapters(skill, query, 1);
    if (chapter) {
      chapters.push({
        title: chapter.title,
        topics: Array.isArray(chapter.topics) ? chapter.topics : [],
        content: chapter.content ?? "",
      });
    }
    if (chapters.length >= limit) break;
  }
  return chapters;
}

/**
 * Topic context enhanced with, in priority order: (1) the day's distilled
 * source chapters when the user attached content directly to this day, (2)
 * the chapters explicitly scheduled onto this day (Step 4 of the plan
 * wizard), and (3) — only if there's still room — the best matching chapter
 * from each other selected library resource, query-routed. Progressive
 * disclosure rather than whole-document dumps.
 */
export async function buildGroundedDayContext(
  userId: string,
  day: PlanDayWithContext,
  query: string,
  chapterLimit = 2,
): Promise<DayTopicContext> {
  const topics = buildTopicContext(day);
  const context = await buildGroundedContext({
    userId,
    planDayId: day.id,
    planName: topics.planName,
    topics: topics.topics,
    query,
    chapterLimit,
  });

  let remaining = chapterLimit - (context.chapters?.length ?? 0);

  if (remaining > 0) {
    const assignedChapters = loadAssignedChapterContent(day).slice(0, remaining);
    if (assignedChapters.length > 0) {
      context.chapters = [...(context.chapters ?? []), ...assignedChapters];
      remaining -= assignedChapters.length;
    }
  }

  if (remaining > 0) {
    const libraryChapters = await loadPlanLibraryChapters(userId, day, query, remaining);
    if (libraryChapters.length > 0) {
      context.chapters = [...(context.chapters ?? []), ...libraryChapters];
    }
  }

  return context;
}