import { SkeletonLoading } from "~/shared/components/skeleton-loading";

/**
 * Mirrors `LibraryItemCard` block for block — tile, title, source line, status
 * chip, summary, chapter chips, footer — so the grid doesn't reflow when the
 * real cards arrive.
 */
export function LibraryCardSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 rounded-card border border-border-subtle bg-surface-card p-5 shadow-sm">
      <div className="flex items-start gap-3.5">
        <SkeletonLoading className="size-11 shrink-0 rounded-control" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <SkeletonLoading className="h-4 w-1/2" />
          <SkeletonLoading className="h-3.5 w-2/5" />
        </div>
        <SkeletonLoading className="h-6 w-16 shrink-0 rounded-pill" />
      </div>

      <div className="flex min-h-10 flex-col gap-1.5">
        <SkeletonLoading className="h-3 w-full" />
        <SkeletonLoading className="h-3 w-3/4" />
      </div>

      <div className="flex gap-1.5">
        <SkeletonLoading className="h-5 w-24 rounded-pill" />
        <SkeletonLoading className="h-5 w-20 rounded-pill" />
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border-subtle pt-3">
        <SkeletonLoading className="h-4 w-24" />
        <SkeletonLoading className="size-8 rounded-control" />
      </div>
    </div>
  );
}
