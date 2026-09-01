import { z } from "zod";

export const createStudyNoteSchema = z.object({
  text: z.string().trim().min(1, "Note text is required").max(4000),
  categoryId: z.string().trim().min(1).max(64),
  sourceLabel: z.string().trim().max(160).optional(),
});
export type CreateStudyNoteInput = z.infer<typeof createStudyNoteSchema>;
