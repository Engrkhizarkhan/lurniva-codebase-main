import { z } from "zod";
import { paginationQuerySchema, searchQuerySchema } from "./list.js";

export const teacherAvailabilitySchema = z.enum([
  "available",
  "limited",
  "full",
]);
export type TeacherAvailability = z.infer<typeof teacherAvailabilitySchema>;

/** `GET /api/teachers` — browse the published teacher listings. */
export const listTeachersQuerySchema = paginationQuerySchema
  .extend(searchQuerySchema.shape)
  .extend({
    availability: teacherAvailabilitySchema.optional(),
  });
export type ListTeachersQuery = z.infer<typeof listTeachersQuerySchema>;
