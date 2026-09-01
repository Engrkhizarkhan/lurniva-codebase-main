import type { Prisma } from "@lurniva/db";
import type { BuiltPlanRows } from "./build-plan-rows";
import { toDbDate } from "./plan-mapper";

type TxClient = Prisma.TransactionClient;

/** Inserts the day/task rows a create or full replace produced for `planId`. */
export async function persistPlanDaysAndTasks(
  tx: TxClient,
  planId: bigint,
  built: BuiltPlanRows,
): Promise<void> {
  if (built.days.length === 0) return;

  const days = await tx.planDay.createManyAndReturn({
    data: built.days.map((day) => ({
      planId,
      dayNumber: day.dayNumber,
      scheduledDate: toDbDate(day.scheduledDate),
      isRestDay: day.isRestDay,
    })),
  });

  if (built.tasks.length === 0) return;

  const dayIdByNumber = new Map(days.map((day) => [day.dayNumber, day.id]));
  await tx.planTask.createMany({
    data: built.tasks.map((task) => ({
      planDayId: dayIdByNumber.get(task.dayNumber)!,
      topicId: task.topicId,
      subtopicId: task.subtopicId,
      libraryItemId: task.libraryItemId,
      chapterId: task.chapterId,
      title: task.title,
      orderIndex: task.orderIndex,
    })),
  });
}
