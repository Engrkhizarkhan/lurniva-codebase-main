import type { ReactNode } from "react";
import { cn } from "./cn.js";
import { Icon } from "./icon.js";
import type { IconName } from "./icon.js";

export type BadgeTone =
  | "neutral"
  | "primary"
  | "ai"
  | "student"
  | "teacher"
  | "game"
  | "success"
  | "warning"
  | "error"
  | "info";

export interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: IconName;
  solid?: boolean;
  caps?: boolean;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-surface-sunken text-text-muted",
  primary: "bg-primary-soft text-primary",
  ai: "bg-role-ai-soft text-role-ai-ink",
  student: "bg-role-student-soft text-ember-700",
  teacher: "bg-role-teacher-soft text-teal-600",
  game: "bg-role-gamification-soft text-role-ai-ink",
  success: "bg-success-soft text-forest-600",
  warning: "bg-warning-soft text-amber-600",
  error: "bg-error-soft text-clay-600",
  info: "bg-info-soft text-teal-600",
};

const solidToneClasses: Record<BadgeTone, string> = {
  neutral: "bg-text-muted text-cream-100",
  primary: "bg-primary text-cream-100",
  ai: "bg-role-ai-ink text-cream-100",
  student: "bg-ember-700 text-cream-100",
  teacher: "bg-teal-600 text-cream-100",
  game: "bg-role-ai-ink text-cream-100",
  success: "bg-forest-600 text-cream-100",
  warning: "bg-amber-600 text-cream-100",
  error: "bg-clay-600 text-cream-100",
  info: "bg-teal-600 text-cream-100",
};

export function Badge({
  children,
  tone = "neutral",
  icon,
  solid = false,
  caps = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-semibold leading-tight whitespace-nowrap",
        solid ? solidToneClasses[tone] : toneClasses[tone],
        caps ? "uppercase tracking-caps" : undefined,
        className,
      )}
    >
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </span>
  );
}
