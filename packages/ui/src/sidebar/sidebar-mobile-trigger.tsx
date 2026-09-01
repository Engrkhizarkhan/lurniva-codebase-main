"use client";

import { cn } from "../cn.js";
import { Icon } from "../icon.js";
import { useSidebar } from "./sidebar-context.js";
import type { ButtonHTMLAttributes } from "react";

export type SidebarMobileTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "type"
>;

export function SidebarMobileTrigger({
  className,
  ...props
}: SidebarMobileTriggerProps) {
  const { mobileOpen, setMobileOpen, mobileTriggerRef } = useSidebar();

  return (
    <button
      ref={mobileTriggerRef}
      type="button"
      aria-label="Open navigation"
      aria-expanded={mobileOpen}
      onClick={() => setMobileOpen(true)}
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-control text-text-heading hover:bg-surface-subtle",
        className,
      )}
      {...props}
    >
      <Icon name="menu" size={22} />
    </button>
  );
}