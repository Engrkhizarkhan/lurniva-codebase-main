import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  /** False once the list is exhausted — no further pages are requested. */
  hasMore: boolean;
  /** True while a page is in flight, so we never queue a duplicate request. */
  isLoading: boolean;
  onLoadMore: () => void;
  /** How far below the viewport the sentinel starts counting as visible. */
  rootMargin?: string;
}

/**
 * Returns a callback ref for a sentinel element placed at the end of a list.
 * `onLoadMore` fires when the sentinel is visible and there is another page to
 * fetch, and again after that page settles if the sentinel is *still* visible
 * (a short page won't push it off-screen). Both guards live here rather than
 * being repeated in each list UI.
 */
export function useInfiniteScroll({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = "240px",
}: UseInfiniteScrollOptions) {
  const [sentinel, setSentinel] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  // Held in a ref so a new callback identity each render doesn't re-run the
  // fetch effect — only visibility and load state should drive it.
  const loadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    loadMoreRef.current = onLoadMore;
  });

  useEffect(() => {
    if (!sentinel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setIsVisible(entries[0]?.isIntersecting ?? false),
      { rootMargin },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [sentinel, rootMargin]);

  useEffect(() => {
    if (isVisible && hasMore && !isLoading) loadMoreRef.current();
  }, [isVisible, hasMore, isLoading]);

  return useCallback((node: HTMLElement | null) => setSentinel(node), []);
}
