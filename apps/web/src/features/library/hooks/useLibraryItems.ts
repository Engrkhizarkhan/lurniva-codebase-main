import { useQuery } from "@tanstack/react-query";
import type { Paginated } from "@lurniva/types";
import { authFetch } from "~/shared/lib/api-client";
import type { LibraryItemDto } from "../services/library-items";

export const LIBRARY_QUERY_KEY = ["library"] as const;

/** How often a list holding a `processing` item re-checks for it settling. */
export const LIBRARY_PROCESSING_POLL_MS = 3000;

/** Big enough to cover a user's whole library in one request. */
const ALL_ITEMS_LIMIT = 50;

async function fetchLibraryItems(): Promise<LibraryItemDto[]> {
  const result = await authFetch<Paginated<LibraryItemDto>>(
    `/api/library?limit=${ALL_ITEMS_LIMIT}`,
  );
  if (!result.success) throw new Error(result.error.message);
  return result.data.items ?? [];
}

export function hasProcessingItem(
  items: LibraryItemDto[] | undefined,
): boolean {
  return (items ?? []).some((item) => item.status === "processing");
}

/**
 * The whole library as a flat list — used by the plan wizard's content picker,
 * which needs every item at once rather than a page. While anything is still
 * being distilled the query re-checks so the picker settles on its own.
 */
export function useLibraryItems() {
  return useQuery({
    queryKey: LIBRARY_QUERY_KEY,
    queryFn: fetchLibraryItems,
    refetchInterval: (query) =>
      hasProcessingItem(query.state.data) ? LIBRARY_PROCESSING_POLL_MS : false,
  });
}

export type { LibraryItemDto } from "../services/library-items";
