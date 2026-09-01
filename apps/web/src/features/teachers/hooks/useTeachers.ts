import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Paginated } from "@lurniva/types";
import { authFetch } from "~/shared/lib/api-client";
import type { TeacherAvailability, TeacherDto } from "../types";

export interface TeacherFilters {
  q?: string;
  availability?: TeacherAvailability;
}

const PAGE_SIZE = 12;

export const TEACHERS_QUERY_KEY = ["teachers"] as const;

function teachersUrl(filters: TeacherFilters, offset: number): string {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  if (filters.q) params.set("q", filters.q);
  if (filters.availability) params.set("availability", filters.availability);
  return `/api/teachers?${params.toString()}`;
}

async function fetchTeacherPage(
  filters: TeacherFilters,
  offset: number,
): Promise<Paginated<TeacherDto>> {
  const result = await authFetch<Paginated<TeacherDto>>(
    teachersUrl(filters, offset),
  );
  if (!result.success) throw new Error(result.error.message);
  return result.data;
}

/**
 * The teacher browse list. Owns paging, flattening and the derived counts so
 * `TeachersPage` only renders — it never computes an offset or reads a page
 * boundary itself.
 */
export function useTeachers(filters: TeacherFilters) {
  const query = useInfiniteQuery({
    queryKey: [
      ...TEACHERS_QUERY_KEY,
      filters.q ?? "",
      filters.availability ?? "",
    ],
    queryFn: ({ pageParam }) => fetchTeacherPage(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.items.length : undefined,
  });

  const teachers = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return {
    teachers,
    total: query.data?.pages[0]?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
  };
}
