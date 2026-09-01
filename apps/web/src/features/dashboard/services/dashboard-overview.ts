import { prisma } from "@lurniva/db";
import type { StudyNote } from "../../day-study/types";
import { listStudyNotes } from "../../notes/services/notes";
import { toPlanDetail } from "../../plan/services/plan-mapper";
import type { Plan } from "../../plan/types";

const RECENT_NOTES_LIMIT = 5;

export interface DashboardOverview {
  userName: string | null;
  /** The most recently created plan, with its full day/task detail — null if none exists yet. */
  plan: Plan | null;
  recentNotes: StudyNote[];
  notesCount: number;
}

/**
 * Everything the dashboard overview page needs, in one round trip: the
 * student's name, their most recent study plan (so the page can derive
 * today's day and progress client-side with the same helpers the plan-detail
 * page uses), and a preview of their notes.
 */
export async function getDashboardOverview(userId: string): Promise<DashboardOverview> {
  const [user, planRow, notes] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.studyPlan.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        days: {
          include: { tasks: { include: { topic: true, subtopic: true } } },
        },
      },
    }),
    listStudyNotes(userId),
  ]);

  return {
    userName: user?.name ?? null,
    plan: planRow ? toPlanDetail(planRow) : null,
    recentNotes: notes.slice(0, RECENT_NOTES_LIMIT),
    notesCount: notes.length,
  };
}
