export type UserRole = "admin" | "member";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isOnboarded: boolean;
  curriculum: string | null;
  grade: string | null;
  schoolName: string | null;
  createdAt: string;
  updatedAt: string;
}
