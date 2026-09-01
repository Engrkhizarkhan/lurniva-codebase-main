import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const resendVerificationSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
