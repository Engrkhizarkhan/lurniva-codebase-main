import { cn } from "./cn.js";

export interface DividerProps {
  label?: string;
  className?: string;
}

export function Divider({ label, className }: DividerProps) {
  if (!label) {
    return <hr className={cn("border-border-subtle", className)} />;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <hr className="flex-1 border-border-subtle" />
      <span className="text-sm text-text-muted">{label}</span>
      <hr className="flex-1 border-border-subtle" />
    </div>
  );
}
