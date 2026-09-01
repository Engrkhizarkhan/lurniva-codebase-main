import { prisma } from "@lurniva/db";
import type { DayTopicContext } from "~/server/ai";
import { routeChapters } from "~/server/ai/grounding";
import type { SkillDocLike } from "~/server/ai/grounding";
import { findOwnedPlanId } from "../../plan/services/plan-ownership";
import {
  buildGroundedDayContext,
  findPlanDay,
} from "../../day-study/services/plan-day-lookup";
import type { StudyContextRef, StudyContextSummary, StudySources } from "../types";

/**
 * Resolves the topic a session is studying into the grounded context the AI
 * provider needs. The client only ever sends a `StudyContextRef` (ids); every
 * label and every chapter of source text is looked up here under the calling
 * user's ownership, so a session cannot be pointed at another user's material.
 */

export class StudyContextNotFoundError extends Error {
  constructor(message = "Study topic not found") {
    super(message);
  }
}

export interface ResolvedStudyContext {
  summary: StudyContextSummary;
  topic: DayTopicContext;
}

const CHAPTER_LIMIT = 2;

function asBigInt(value: string | undefined): bigint | null {
  if (!value) return null;
  try {
    return BigInt(value);
  } catch {
    return null;
  }
}

function summaryOf(
  ref: StudyContextRef,
  path: string[],
  sourceLabel: string | null,
): StudyContextSummary {
  return {
    ref,
    path,
    label: path[path.length - 1] ?? "General study",
    sourceLabel,
  };
}

async function resolveCatalog(
  ref: StudyContextRef,
  query: string,
): Promise<ResolvedStudyContext> {
  const topicId = asBigInt(ref.topicId);
  if (!topicId) throw new StudyContextNotFoundError();

  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { subject: true, subtopics: { orderBy: { name: "asc" } } },
  });
  if (!topic) throw new StudyContextNotFoundError();

  const subtopicId = asBigInt(ref.subtopicId);
  const subtopic = subtopicId
    ? topic.subtopics.find((candidate) => candidate.id === subtopicId)
    : undefined;
  if (subtopicId && !subtopic) throw new StudyContextNotFoundError();

  const path = [topic.subject.name, topic.name];
  if (subtopic) path.push(subtopic.name);

  // Studying a whole topic grounds on every subtopic; picking one narrows to it.
  const topics = subtopic
    ? [{ topicLabel: topic.name, subtopicLabel: subtopic.name }]
    : topic.subtopics.length > 0
      ? topic.subtopics.map((entry) => ({
          topicLabel: topic.name,
          subtopicLabel: entry.name,
        }))
      : [{ topicLabel: topic.name, subtopicLabel: null }];

  // The platform library carries a distilled chapter per catalog topic; pull
  // the matching one so catalog study is grounded in text, not just labels.
  const libraryItem = await prisma.libraryItem.findFirst({
    where: { scope: "lurniva", title: topic.subject.name, status: "ready" },
    select: { skill: true },
  });
  const skill = libraryItem?.skill as SkillDocLike | null;
  const chapters =
    skill && Array.isArray(skill.chapters)
      ? routeChapters(skill, `${topic.name} ${query}`, 1).map((chapter) => ({
          title: chapter.title,
          topics: Array.isArray(chapter.topics) ? chapter.topics : [],
          content: chapter.content ?? "",
        }))
      : [];

  return {
    summary: summaryOf(
      { ...ref, subjectId: topic.subjectId.toString() },
      path,
      topic.subject.name,
    ),
    topic: {
      planName: topic.subject.name,
      topicPath: path.join(" → "),
      topics,
      ...(chapters.length > 0 ? { chapters } : {}),
    },
  };
}

async function resolveLibrary(
  userId: string,
  ref: StudyContextRef,
  query: string,
): Promise<ResolvedStudyContext> {
  const itemId = asBigInt(ref.libraryItemId);
  if (!itemId) throw new StudyContextNotFoundError();

  const item = await prisma.libraryItem.findFirst({
    where: { id: itemId, OR: [{ userId }, { userId: null }] },
  });
  if (!item) throw new StudyContextNotFoundError();

  const skill = item.skill as SkillDocLike | null;
  const allChapters = Array.isArray(skill?.chapters) ? skill.chapters : [];
  const picked = ref.chapterId
    ? allChapters.filter(
        (chapter) => (chapter.id ?? chapter.title) === ref.chapterId,
      )
    : skill
      ? routeChapters(skill, query, CHAPTER_LIMIT)
      : [];

  if (ref.chapterId && picked.length === 0) throw new StudyContextNotFoundError();

  const path = [item.title];
  if (ref.chapterId && picked[0]) path.push(picked[0].title);

  return {
    summary: summaryOf(ref, path, `Library · ${item.title}`),
    topic: {
      planName: item.title,
      topicPath: path.join(" → "),
      topics:
        picked.length > 0
          ? picked.map((chapter) => ({
              topicLabel: chapter.title,
              subtopicLabel: null,
            }))
          : [{ topicLabel: item.title, subtopicLabel: null }],
      ...(picked.length > 0
        ? {
            chapters: picked.map((chapter) => ({
              title: chapter.title,
              topics: Array.isArray(chapter.topics) ? chapter.topics : [],
              content: chapter.content ?? "",
            })),
          }
        : {}),
    },
  };
}

async function resolvePlanDay(
  userId: string,
  ref: StudyContextRef,
  query: string,
): Promise<ResolvedStudyContext> {
  if (!ref.planId || typeof ref.dayNumber !== "number") {
    throw new StudyContextNotFoundError();
  }
  const planDbId = await findOwnedPlanId(userId, ref.planId);
  const day = await findPlanDay(planDbId, ref.dayNumber);
  const context = await buildGroundedDayContext(userId, day, query);

  const path = [day.plan.name, `Day ${day.dayNumber}`];
  const firstTask = day.tasks[0];
  if (firstTask) {
    path.push(
      firstTask.subtopic?.name ?? firstTask.topic?.name ?? firstTask.title ?? "Study",
    );
  }

  return {
    summary: summaryOf(ref, path, `${day.plan.name} · Day ${day.dayNumber}`),
    topic: { ...context, topicPath: path.join(" → ") },
  };
}

/** The un-grounded fallback: the student just wants to talk to the tutor. */
function resolveGeneral(ref: StudyContextRef): ResolvedStudyContext {
  return {
    summary: summaryOf(ref, ["General study"], null),
    topic: {
      planName: "General study",
      topicPath: "General study",
      topics: [],
    },
  };
}

export async function resolveStudyContext(
  userId: string,
  ref: StudyContextRef,
  query: string,
): Promise<ResolvedStudyContext> {
  switch (ref.kind) {
    case "catalog":
      return resolveCatalog(ref, query);
    case "library":
      return resolveLibrary(userId, ref, query);
    case "plan_day":
      return resolvePlanDay(userId, ref, query);
    default:
      return resolveGeneral(ref);
  }
}

/** Everything the topic picker offers, in one payload. */
export async function listStudySources(userId: string): Promise<StudySources> {
  const [subjects, libraryItems, plans] = await Promise.all([
    prisma.subject.findMany({
      where: { userId: null },
      orderBy: { name: "asc" },
      include: {
        topics: {
          orderBy: { name: "asc" },
          include: { subtopics: { orderBy: { name: "asc" } } },
        },
      },
    }),
    prisma.libraryItem.findMany({
      where: { status: "ready", OR: [{ userId }, { userId: null }] },
      orderBy: [{ scope: "asc" }, { updatedAt: "desc" }],
      select: { id: true, title: true, scope: true, skill: true },
    }),
    prisma.studyPlan.findMany({
      where: { userId, status: "active" },
      orderBy: { startDate: "desc" },
      select: {
        id: true,
        name: true,
        days: {
          where: { isRestDay: false },
          orderBy: { dayNumber: "asc" },
          select: {
            dayNumber: true,
            tasks: {
              orderBy: { orderIndex: "asc" },
              take: 1,
              select: { title: true, topic: { select: { name: true } } },
            },
          },
        },
      },
    }),
  ]);

  return {
    subjects: subjects.map((subject) => ({
      id: subject.id.toString(),
      label: subject.name,
      topics: subject.topics.map((topic) => ({
        id: topic.id.toString(),
        label: topic.name,
        subtopics: topic.subtopics.map((subtopic) => ({
          id: subtopic.id.toString(),
          label: subtopic.name,
        })),
      })),
    })),
    library: libraryItems.map((item) => {
      const skill = item.skill as SkillDocLike | null;
      const chapters = Array.isArray(skill?.chapters) ? skill.chapters : [];
      return {
        id: item.id.toString(),
        title: item.title,
        scope: item.scope,
        chapters: chapters.map((chapter) => ({
          id: chapter.id ?? chapter.title,
          title: chapter.title,
        })),
      };
    }),
    plans: plans.map((plan) => ({
      id: plan.id.toString(),
      name: plan.name,
      days: plan.days.map((day) => ({
        dayNumber: day.dayNumber,
        label:
          day.tasks[0]?.topic?.name ??
          day.tasks[0]?.title ??
          `Day ${day.dayNumber}`,
      })),
    })),
  };
}
