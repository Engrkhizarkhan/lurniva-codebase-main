"use client";

import { useEffect, useRef } from "react";
import { cn } from "../cn.js";
import { Icon } from "../icon.js";
import { useSidebar } from "./sidebar-context.js";
import type { SidebarLinkProps, SidebarProps } from "./interface.js";
import { SidebarBody } from "./sidebar-body.js";

function DefaultLink({ href, className, children, onClick }: SidebarLinkProps) {
  return (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  );
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Sidebar({
  items,
  activeId,
  linkComponent,
  user,
  onSignOut,
  logoHref = "/dashboard",
  className,
}: SidebarProps) {
  const {
    collapsed,
    toggleCollapsed,
    mobileOpen,
    setMobileOpen,
    mobileTriggerRef,
  } = useSidebar();
  const LinkComponent = linkComponent ?? DefaultLink;
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mobileOpen) return;

    const drawer = drawerRef.current;
    const trigger = mobileTriggerRef.current;
    const focusables = drawer
      ? Array.from(drawer.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    focusables[0]?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [mobileOpen, setMobileOpen, mobileTriggerRef]);

  return (
    <>
      <nav
        className={cn(
          "hidden shrink-0 flex-col gap-6 bg-surface-inverse p-3 text-text-on-primary md:flex",
          "transition-[width] duration-(--dur-sidebar) ease-standard",
          collapsed ? "md:w-(--sidebar-w-collapsed)" : "md:w-(--sidebar-w)",
          className,
        )}
      >
        <SidebarBody
          collapsed={collapsed}
          items={items}
          activeId={activeId}
          LinkComponent={LinkComponent}
          user={user}
          onSignOut={onSignOut}
          logoHref={logoHref}
          collapseToggle={
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-control text-text-on-primary/70 hover:bg-text-on-primary/10 hover:text-text-on-primary"
            >
              <Icon
                name={collapsed ? "panel-left-open" : "panel-left-close"}
                size={18}
              />
            </button>
          }
        />
      </nav>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-surface-overlay transition-opacity duration-(--dur-sidebar) md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        )}
        aria-hidden={!mobileOpen}
        onClick={() => setMobileOpen(false)}
      />
      <nav
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-(--sidebar-w) flex-col gap-6 bg-surface-inverse p-3 text-text-on-primary md:hidden",
          "transition-transform duration-(--dur-sidebar) ease-standard",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarBody
          collapsed={false}
          items={items}
          activeId={activeId}
          LinkComponent={LinkComponent}
          user={user}
          onSignOut={onSignOut}
          logoHref={logoHref}
          onNavigate={() => setMobileOpen(false)}
        />
      </nav>
    </>
  );
}