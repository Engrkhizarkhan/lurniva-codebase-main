import { cn } from "@lurniva/ui";

export interface SkeletonLoadingProps {
  className?: string;
}

export function SkeletonLoading({ className }: SkeletonLoadingProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-lg bg-surface-sunken", className)}
    />
  );
}
