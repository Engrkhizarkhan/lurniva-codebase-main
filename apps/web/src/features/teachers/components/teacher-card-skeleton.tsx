import { SkeletonLoading } from "~/shared/components/skeleton-loading";

/**
 * Mirrors `TeacherCard`'s box model exactly — same padding, gaps and element
 * heights — so swapping in real data doesn't shift the grid.
 */
export function TeacherCardSkeleton() {
  return (
    <div className="flex flex-col gap-3.5 rounded-card border border-border-subtle bg-surface-card p-5 shadow-sm">
      <div className="flex items-start gap-3.5">
        <SkeletonLoading className="size-11 shrink-0 rounded-control" />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <SkeletonLoading className="h-4 w-2/5" />
          <SkeletonLoading className="h-3.5 w-3/5" />
        </div>
        <SkeletonLoading className="h-6 w-20 shrink-0 rounded-pill" />
      </div>

      <SkeletonLoading className="h-4 w-32" />

      <div className="flex flex-col gap-1.5">
        <SkeletonLoading className="h-3 w-full" />
        <SkeletonLoading className="h-3 w-4/5" />
      </div>

      <div className="flex gap-1.5">
        <SkeletonLoading className="h-5 w-16 rounded-pill" />
        <SkeletonLoading className="h-5 w-20 rounded-pill" />
      </div>

      <div className="mt-auto border-t border-border-subtle pt-3">
        <SkeletonLoading className="h-5 w-36" />
      </div>
    </div>
  );
}
