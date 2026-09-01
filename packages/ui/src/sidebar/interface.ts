import type { ComponentType, ReactNode } from "react";
import type { IconName } from "../icon";

export interface SidebarBodyProps {
  collapsed: boolean;
  items: SidebarNavItem[];
  activeId: string;
  LinkComponent: ComponentType<SidebarLinkProps>;
  user?: SidebarUser;
  onSignOut: () => void;
  logoHref: string;
  onNavigate?: () => void;
  collapseToggle?: ReactNode;
}

export interface SidebarNavItem {
  id: string;
  label: string;
  icon: IconName;
  href: string;
  /**
   * Optional section heading. Consecutive items sharing a group are rendered
   * under one label, so ordering the array is all a consumer has to do — the
   * sidebar never hardcodes what the groups are.
   */
  group?: string;
}

/** Items bucketed by `group`, in the order they first appeared. */
export interface SidebarNavGroup {
  label: string | null;
  items: SidebarNavItem[];
}

export interface SidebarUser {
  email: string;
}

export interface SidebarLinkProps {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export interface SidebarProps {
  items: SidebarNavItem[];
  activeId: string;
  linkComponent?: ComponentType<SidebarLinkProps>;
  user?: SidebarUser;
  onSignOut: () => void;
  logoHref?: string;
  className?: string;
}
