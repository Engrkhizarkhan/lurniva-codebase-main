import { cn } from "./cn.js";

export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type AvatarRole = "teacher" | "student" | "ai";

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  role?: AvatarRole;
  badge?: string;
  className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
};

const ringClasses: Record<AvatarRole, string> = {
  teacher: "ring-role-teacher",
  student: "ring-role-student",
  ai: "ring-role-ai",
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  src,
  size = "md",
  role,
  badge,
  className,
}: AvatarProps) {
  return (
    <span className={cn("relative inline-flex shrink-0", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center overflow-hidden rounded-pill bg-forest-100 font-display font-bold text-forest-800 ring-2 ring-surface-card",
          sizeClasses[size],
          role ? cn("ring-4", ringClasses[role]) : undefined,
        )}
      >
        {src ? (
          <img src={src} alt={name} className="size-full object-cover" />
        ) : (
          initialsOf(name)
        )}
      </span>
      {badge ? (
        <span className="absolute -right-0.5 -bottom-0.5 rounded-pill border-2 border-surface-card bg-accent px-1 text-[10px] font-bold text-text-on-accent">
          {badge}
        </span>
      ) : null}
    </span>
  );
}
