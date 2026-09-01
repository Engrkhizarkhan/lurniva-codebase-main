import { cn } from "./cn.js";
import { Icon } from "./icon.js";

export type AIBadgeSize = "sm" | "md";

export interface AIBadgeProps {
  label?: string;
  dark?: boolean;
  size?: AIBadgeSize;
  className?: string;
}

/** The recurring "Lurniva AI" / "AI generated" pill used to flag AI-produced content. */
export function AIBadge({
  label = "AI generated",
  dark = false,
  size = "md",
  className,
}: AIBadgeProps) {
  const sm = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-pill border font-semibold uppercase tracking-caps whitespace-nowrap",
        sm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        dark
          ? "border-lime-500/30 bg-lime-500/15 text-lime-500"
          : "border-lime-300 bg-role-ai-soft text-role-ai-ink",
        className,
      )}
    >
      <Icon name="sparkles" size={sm ? 13 : 14} />
      {label}
    </span>
  );
}
