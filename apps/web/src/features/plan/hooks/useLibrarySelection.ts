import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authFetch } from "~/shared/lib/api-client";
import { useLibraryItems } from "../../library/hooks/useLibraryItems";
import type { LibraryItemDto } from "../../library/services/library-items";

export interface UseLibrarySelectionResult {
  items: LibraryItemDto[];
  isLoading: boolean;
  isError: boolean;
  selectedIds: string[];
  /** Ids currently being processed after selection. */
  processingIds: string[];
  toggleItem: (itemId: string) => void;
  selectedCount: number;
}

interface UseLibrarySelectionArgs {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

/**
 * Library picker for the plan's "Select content" step. Ticking an item selects
 * it for the plan; if it isn't processed yet it's processed on the spot (as
 * requested: already-processed content works immediately, raw content is
 * processed when chosen in plan stages).
 */
export function useLibrarySelection({
  selectedIds,
  onChange,
}: UseLibrarySelectionArgs): UseLibrarySelectionResult {
  const queryClient = useQueryClient();
  const query = useLibraryItems();

  const process = useMutation({
    mutationFn: async (itemId: string) => {
      const result = await authFetch<{ item: LibraryItemDto }>(
        `/api/library/${itemId}`,
        { method: "POST" },
      );
      if (!result.success) throw new Error(result.error.message);
      await queryClient.invalidateQueries({ queryKey: ["library"] });
      return result.data.item;
    },
  });

  const selectedSet = new Set(selectedIds);

  function toggleItem(itemId: string) {
    const item = query.data?.find((entry) => entry.id === itemId);
    const next = selectedSet.has(itemId)
      ? selectedIds.filter((id) => id !== itemId)
      : [...selectedIds, itemId];

    onChange(next);

    if (!selectedSet.has(itemId) && item && item.status !== "ready") {
      void process.mutateAsync(itemId).catch(() => undefined);
    }
  }

  return {
    items: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    selectedIds,
    processingIds: process.isPending ? [process.variables ?? ""] : [],
    toggleItem,
    selectedCount: selectedIds.length,
  };
}