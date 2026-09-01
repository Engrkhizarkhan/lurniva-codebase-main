import type { ReactNode, ButtonHTMLAttributes } from "react";

interface TextActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode;
  children: ReactNode;
}

const TextActionButton = ({
  icon,
  children,
  className,
  type = "button",
  ...props
}: TextActionButtonProps) => {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center gap-1.5 self-start",
        "rounded-[var(--radius-sm)]",
        "border-0 bg-transparent",
        "px-2 py-1 pl-1",
        "font-[var(--font-body)] text-sm font-medium",
        "text-[var(--text-muted)]",
        "transition-colors duration-[var(--dur-hover)] ease-[var(--ease-standard)]",
        "hover:bg-[var(--primary-soft)]",
        "hover:text-[var(--text-heading)]",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--primary-soft)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
};

export default TextActionButton;
