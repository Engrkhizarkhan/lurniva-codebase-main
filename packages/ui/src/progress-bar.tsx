import { cn } from "./cn.js";

export type ProgressBarTone = "success" | "warning" | "error";
export type ProgressBarSize = "sm" | "md";

export interface ProgressBarProps {
  value: number;
  tone?: ProgressBarTone;
  size?: ProgressBarSize;
  className?: string;
}

const toneClasses: Record<ProgressBarTone, string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
};

const sizeClasses: Record<ProgressBarSize, string> = {
  sm: "h-1.5",
  md: "h-2",
};

export function ProgressBar({
  value,
  tone = "success",
  size = "md",
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn(
        "w-full overflow-hidden rounded-pill bg-surface-sunken",
        sizeClasses[size],
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-pill transition-[width] duration-300 ease-standard",
          toneClasses[tone],
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
