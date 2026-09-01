import type { TeacherAvailability } from "@lurniva/validation";

export type { TeacherAvailability };

/**
 * A published teacher listing as the browse UI consumes it. Only fields the
 * `teachers` table actually stores are here — nothing is derived or invented
 * on the way out.
 */
export interface TeacherDto {
  id: string;
  name: string;
  headline: string;
  bio: string | null;
  avatarUrl: string | null;
  subjects: string[];
  monthlyFee: number;
  availability: TeacherAvailability;
  rating: number | null;
  reviewCount: number;
}
