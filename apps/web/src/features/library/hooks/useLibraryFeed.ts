import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { Paginated } from "@lurniva/types";
import type { LibraryScope, LibraryStatus } from "@lurniva/validation";
import { authFetch } from "~/shared/lib/api-client";
import type { LibraryItemDto } from "../services/library-items";
import {
  hasProcessingItem,
  LIBRARY_PROCESSING_POLL_MS,
  LIBRARY_QUERY_KEY,
} from "./useLibraryItems";

export interface LibraryFilters {
  scope: LibraryScope;
  q?: string;
  status?: LibraryStatus;
}

const PAGE_SIZE = 12;

/** Query key for one filtered feed — invalidated alongside the flat list. */
export function libraryFeedKey(filters: LibraryFilters) {
  return [
    ...LIBRARY_QUERY_KEY,
    "feed",
    filters.scope,
    filters.q ?? "",
    filters.status ?? "",
  ] as const;
}

async function fetchLibraryPage(
  filters: LibraryFilters,
  offset: number,
): Promise<Paginated<LibraryItemDto>> {
  const params = new URLSearchParams({
    scope: filters.scope,
    limit: String(PAGE_SIZE),
    offset: String(offset),
  });
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);

  const result = await authFetch<Paginated<LibraryItemDto>>(
    `/api/library?${params.toString()}`,
  );
  if (!result.success) throw new Error(result.error.message);
  return result.data;
}

/**
 * The paged Library grid. Owns paging, flattening and the processing poll, so
 * `LibraryPage` renders a list and a few flags and nothing else. While any
 * loaded item is still being distilled the feed re-checks until it settles,
 * which is what moves a just-uploaded card from Processing to Ready.
 */
export function useLibraryFeed(filters: LibraryFilters) {
  const query = useInfiniteQuery({
    queryKey: libraryFeedKey(filters),
    queryFn: ({ pageParam }) => fetchLibraryPage(filters, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.items.length : undefined,
    refetchInterval: (current) =>
      hasProcessingItem(current.state.data?.pages.flatMap((page) => page.items))
        ? LIBRARY_PROCESSING_POLL_MS
        : false,
  });

  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.items) ?? [],
    [query.data],
  );

  return {
    items,
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
