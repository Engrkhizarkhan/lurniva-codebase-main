import { z } from "zod";

export const userRoleSchema = z.enum(["admin", "member"]);

export const createUserSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  name: z.string().min(1).max(120).optional(),
  role: userRoleSchema.optional(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  role: userRoleSchema.optional(),
});
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
