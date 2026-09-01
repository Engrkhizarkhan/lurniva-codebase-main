import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import type { LibraryItemDto } from "../services/library-items";
import { LIBRARY_QUERY_KEY } from "./useLibraryItems";

/**
 * Per-item actions on the library: delete a personal item, or ask the server
 * to process one that is raw or failed. Both invalidate every library query
 * (the flat list and each filtered feed share the `["library"]` prefix).
 */
export function useLibraryActions() {
  const queryClient = useQueryClient();

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
  }

  const removeContent = useMutation({
    mutationFn: async (itemId: string) => {
      const result = await authFetch<{ deleted: boolean }>(
        `/api/library/${itemId}`,
        { method: "DELETE" },
      );
      if (!result.success) throw new Error(result.error.message);
      await invalidate();
      return result.data.deleted;
    },
  });

  const reprocessContent = useMutation({
    mutationFn: async (itemId: string) => {
      const result = await authFetch<{ item: LibraryItemDto }>(
        `/api/library/${itemId}`,
        { method: "POST" },
      );
      if (!result.success) throw new Error(result.error.message);
      await invalidate();
      return result.data.item;
    },
  });

  return { removeContent, reprocessContent };
}
