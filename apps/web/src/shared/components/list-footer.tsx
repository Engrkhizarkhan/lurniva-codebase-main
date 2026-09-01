import { Loader2 } from "lucide-react";

export interface ListFooterProps {
  loadedCount: number;
  total: number;
  /** Singular noun for the list's items, e.g. "teacher". */
  noun: string;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}

/**
 * The line under a paged list: loading-more while a page is in flight, the
 * running count while more remain, and an explicit end-of-results once the
 * list is exhausted.
 */
export function ListFooter({
  loadedCount,
  total,
  noun,
  isFetchingNextPage,
  hasNextPage,
}: ListFooterProps) {
  const plural = total === 1 ? noun : `${noun}s`;

  return (
    <p
      aria-live="polite"
      className="flex items-center justify-center gap-2 text-center text-[13px] text-text-faint"
    >
      {isFetchingNextPage ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Loading more {noun}s…
        </>
      ) : hasNextPage ? (
        `Showing ${loadedCount} of ${total} ${plural}`
      ) : (
        `That's all ${total} ${plural}.`
      )}
    </p>
  );
}
