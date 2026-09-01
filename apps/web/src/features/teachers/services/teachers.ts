import { prisma, type Prisma } from "@lurniva/db";
import type { Paginated } from "@lurniva/types";
import type { ListTeachersQuery } from "@lurniva/validation";
import type { TeacherAvailability, TeacherDto } from "../types";

/**
 * Browse the platform's published teacher listings. Offset paging over a
 * stable `(name, id)` order, so a page boundary can't drop or repeat a row
 * while the student scrolls.
 */

function toDto(
  teacher: Prisma.TeacherGetPayload<Record<string, never>>,
): TeacherDto {
  return {
    id: teacher.id.toString(),
    name: teacher.name,
    headline: teacher.headline,
    bio: teacher.bio,
    avatarUrl: teacher.avatarUrl,
    subjects: teacher.subjects,
    monthlyFee: teacher.monthlyFee,
    availability: teacher.availability as TeacherAvailability,
    rating: teacher.rating === null ? null : Number(teacher.rating),
    reviewCount: teacher.reviewCount,
  };
}

function buildWhere(query: ListTeachersQuery): Prisma.TeacherWhereInput {
  const where: Prisma.TeacherWhereInput = { isPublished: true };
  if (query.availability) where.availability = query.availability;
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { headline: { contains: query.q, mode: "insensitive" } },
      { subjects: { hasSome: [query.q] } },
    ];
  }
  return where;
}

export async function listTeachers(
  query: ListTeachersQuery,
): Promise<Paginated<TeacherDto>> {
  const where = buildWhere(query);
  const [rows, total] = await Promise.all([
    prisma.teacher.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      skip: query.offset,
      take: query.limit,
    }),
    prisma.teacher.count({ where }),
  ]);

  return {
    items: rows.map(toDto),
    total,
    limit: query.limit,
    offset: query.offset,
    hasMore: query.offset + rows.length < total,
  };
}
