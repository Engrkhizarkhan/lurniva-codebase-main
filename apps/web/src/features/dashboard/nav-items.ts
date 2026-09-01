import type { SidebarNavItem } from "@lurniva/ui";

/**
 * Sidebar navigation, in three groups. Items are rendered in this order and
 * bucketed by `group`, so keep each group's entries contiguous.
 *
 * - Learning — where the studying happens.
 * - Community — the social surfaces around it.
 * - Account — the user's own settings and plan.
 */
export const DASHBOARD_NAV_ITEMS: SidebarNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "layout-dashboard",
    href: "/dashboard",
    group: "Learning",
  },
  {
    id: "ai-study",
    label: "AI Study",
    icon: "sparkles",
    href: "/dashboard/ai-study",
    group: "Learning",
  },
  {
    id: "plan",
    label: "Study Planner",
    icon: "calendar-check-2",
    href: "/dashboard/plan",
    group: "Learning",
  },
  {
    id: "library",
    label: "Library",
    icon: "library",
    href: "/dashboard/library",
    group: "Learning",
  },
  {
    id: "my-notes",
    label: "My Notes",
    icon: "notebook-pen",
    href: "/dashboard/my-notes",
    group: "Learning",
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: "presentation",
    href: "/dashboard/teachers",
    group: "Learning",
  },

  {
    id: "channels",
    label: "Channels",
    icon: "radio",
    href: "/dashboard/channels",
    group: "Community",
  },

  {
    id: "settings",
    label: "Settings",
    icon: "settings",
    href: "/dashboard/settings",
    group: "Account",
  },
  // {
  //   id: "pricing",
  //   label: "Plan & billing",
  //   icon: "credit-card",
  //   href: "/dashboard/pricing",
  //   group: "Account",
  // },
];
