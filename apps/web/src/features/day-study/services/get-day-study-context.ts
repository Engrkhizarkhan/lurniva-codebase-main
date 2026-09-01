import { prisma } from "@lurniva/db";
import type { PlanItemStatus } from "../../plan/types";
import { findOwnedPlanId } from "../../plan/services/plan-ownership";
import { findPlanDay } from "./plan-day-lookup";
import type {
  ChatMessageDto,
  DayStudyContext,
  DayStudyTask,
  LearningContentDto,
  LearningFeature,
} from "../types";

function formatDbDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getDayStudyContext(
  userId: string,
  planId: string,
  dayNumber: number,
): Promise<DayStudyContext> {
  const planDbId = await findOwnedPlanId(userId, planId);
  const day = await findPlanDay(planDbId, dayNumber);

  const tasks: DayStudyTask[] = day.tasks.map((task) => ({
    id: task.id.toString(),
    topicLabel: task.title ?? task.topic?.name ?? "Untitled",
    subtopicLabel: task.subtopic?.name ?? null,
    status: task.status as PlanItemStatus,
  }));

  const [chatSession, learningSessions, user] = await Promise.all([
    prisma.aiSession.findUnique({
      where: { planDayId_mode_feature: { planDayId: day.id, mode: "chat", feature: "chat" } },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    }),
    prisma.aiSession.findMany({
      where: { planDayId: day.id, mode: "learning" },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
  ]);

  const chatMessages: ChatMessageDto[] = (chatSession?.messages ?? []).map((message) => ({
    id: message.id.toString(),
    role: message.role as "user" | "assistant",
    content: message.content,
    createdAt: message.createdAt.toISOString(),
  }));

  const learningContent: Partial<Record<LearningFeature, LearningContentDto>> = {};
  for (const session of learningSessions) {
    const latest = session.messages[0];
    if (latest) {
      learningContent[session.feature as LearningFeature] = {
        content: latest.content,
        updatedAt: latest.createdAt.toISOString(),
      };
    }
  }

  return {
    plan: { id: planId, name: day.plan.name },
    user: { name: user?.name ?? null },
    day: {
      dayNumber: day.dayNumber,
      scheduledDate: formatDbDate(day.scheduledDate),
      status: day.status as PlanItemStatus,
      tasks,
    },
    chat: { sessionId: chatSession ? chatSession.id.toString() : null, messages: chatMessages },
    learningContent,
  };
}
