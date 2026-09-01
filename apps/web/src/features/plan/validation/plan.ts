import { z } from "zod";

const topicAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
  kind: z.literal("topic"),
  topicId: z.string().min(1),
  subjectId: z.string().min(1),
  subtopicIds: z.array(z.string().min(1)),
  startDayIndex: z.number().int().min(1),
  durationDays: z.number().int().min(1),
});

const chapterAssignmentSchema = z.object({
  assignmentId: z.string().min(1),
  kind: z.literal("chapter"),
  libraryItemId: z.string().min(1),
  chapterId: z.string().min(1),
  startDayIndex: z.number().int().min(1),
  durationDays: z.number().int().min(1),
});

const scheduleAssignmentSchema = z.discriminatedUnion("kind", [
  topicAssignmentSchema,
  chapterAssignmentSchema,
]);

const assignDaysDraftSchema = z.object({
  assignments: z.array(scheduleAssignmentSchema),
  restDayIndexes: z.array(z.number().int().min(1)),
});

const contentSelectionDraftSchema = z.object({
  selectedSubtopicIdsByTopicId: z.record(z.string(), z.array(z.string())),
  libraryItemIds: z.array(z.string()).optional().default([]),
});

const basicInfoDraftSchema = z.object({
  name: z.string().trim().min(1, "Plan name is required").max(200),
  dailyStudyHours: z.number().positive("Study hours must be greater than 0"),
});

const schedulePeriodDraftSchema = z
  .object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
  })
  .refine((schedule) => schedule.endDate >= schedule.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export const createPlanDraftSchema = z.object({
  basicInfo: basicInfoDraftSchema,
  content: contentSelectionDraftSchema,
  schedule: schedulePeriodDraftSchema,
  assignment: assignDaysDraftSchema,
});

export const createPlanSchema = z.object({
  draft: createPlanDraftSchema,
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export const replacePlanSchema = createPlanSchema;
export type ReplacePlanInput = CreatePlanInput;

export const updatePlanQuickSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    startDate: z.string().min(1).optional(),
    endDate: z.string().min(1).optional(),
    studyHoursPerDay: z.number().positive().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided",
  });
export type UpdatePlanQuickInput = z.infer<typeof updatePlanQuickSchema>;
