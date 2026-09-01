"use client";

import { cn } from "../cn";
import { Icon } from "../icon";
import type { SidebarBodyProps, SidebarNavGroup, SidebarNavItem } from "./interface";
import { getInitial } from "./utils";

/**
 * Buckets items by their `group`, preserving the order they were given. An
 * ungrouped item keeps a `null` label and renders without a heading, so a
 * consumer that never sets `group` gets exactly the flat list it had before.
 */
function groupItems(items: SidebarNavItem[]): SidebarNavGroup[] {
  const groups: SidebarNavGroup[] = [];
  for (const item of items) {
    const label = item.group ?? null;
    const current = groups[groups.length - 1];
    if (current && current.label === label) {
      current.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }
  return groups;
}

export function SidebarBody({
  collapsed,
  items,
  activeId,
  LinkComponent,
  user,
  onSignOut,
  logoHref,
  onNavigate,
  collapseToggle,
}: SidebarBodyProps) {
  const groups = groupItems(items);

  return (
    <>
      <div className="flex min-h-7 items-center gap-2 px-2">
        <LinkComponent
          href={logoHref}
          className="flex items-center gap-2 overflow-hidden"
        >
          <Icon
            name="graduation-cap"
            size={24}
            className="shrink-0 text-secondary"
          />
          {!collapsed && (
            <span className="whitespace-nowrap font-display text-[22px] font-extrabold tracking-[-0.02em] text-text-on-primary">
              Lurniva
            </span>
          )}
        </LinkComponent>
        {collapseToggle}
      </div>

      <div className="scrollbar-accent flex-1 overflow-y-auto">
        {groups.map((group, groupIndex) => (
          <div
            key={group.label ?? `group-${groupIndex}`}
            className={cn(groupIndex > 0 && (collapsed ? "mt-3" : "mt-5"))}
          >
            {group.label ? (
              collapsed ? (
                // Collapsed rail has no room for the heading; a hairline keeps
                // the same grouping legible without it.
                <div
                  className="mx-3 mb-2 h-px bg-text-on-primary/14"
                  role="presentation"
                />
              ) : (
                <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-on-primary/45">
                  {group.label}
                </p>
              )
            ) : null}

            <div className="grid gap-1">
              {group.items.map((item) => {
                const active = item.id === activeId;
                return (
                  <LinkComponent
                    key={item.id}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "box-border flex min-h-(--tap-min) items-center gap-3 rounded-md px-3 py-2.5 text-[15px]",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-text-on-primary/12 font-semibold text-accent"
                        : "font-medium text-text-on-primary hover:bg-text-on-primary/8",
                    )}
                  >
                    <Icon name={item.icon} size={20} className="shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </LinkComponent>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-text-on-primary/14 pt-4">
        {user && (
          <div
            className={cn(
              "flex items-center gap-2.5",
              collapsed && "justify-center",
            )}
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text-on-primary/15 text-xs font-semibold text-text-on-primary">
              {getInitial(user.email)}
            </span>
            {!collapsed && (
              <span className="truncate text-sm text-text-on-primary">
                Hi, {user.email}
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onSignOut();
          }}
          className={cn(
            "flex items-center gap-2 rounded-control p-1 text-sm text-text-on-primary/70 hover:text-text-on-primary",
            collapsed && "justify-center",
          )}
        >
          <Icon name="log-out" size={16} className="shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </>
  );
}