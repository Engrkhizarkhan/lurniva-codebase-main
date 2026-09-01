import {
  Link,
  Outlet,
  createFileRoute,
  useLocation,
  useRouteContext,
} from "@tanstack/react-router";
import { Sidebar, SidebarMobileTrigger, SidebarProvider } from "@lurniva/ui";
import type { SidebarLinkProps } from "@lurniva/ui";
import { useSignOut } from "~/features/auth/hooks/useSignOut";
import { DASHBOARD_NAV_ITEMS } from "~/features/dashboard/nav-items";
import { requireOnboarded } from "~/shared/lib/route-guards";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const { user } = await requireOnboarded();
    return { user };
  },
  component: DashboardLayout,
});

function RouterLinkAdapter({
  href,
  className,
  children,
  onClick,
}: SidebarLinkProps) {
  return (
    <Link to={href} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

function getActiveId(pathname: string): string {
  const exact = DASHBOARD_NAV_ITEMS.find((item) => item.href === pathname);
  if (exact) return exact.id;
  const nested = DASHBOARD_NAV_ITEMS.find(
    (item) => item.href !== "/dashboard" && pathname.startsWith(item.href),
  );
  return nested?.id ?? "dashboard";
}

function DashboardLayout() {
  const { user } = useRouteContext({ from: "/dashboard" });
  const location = useLocation();
  const { signOut } = useSignOut();
  const activeId = getActiveId(location.pathname);

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-surface-canvas ">
        <Sidebar
          items={DASHBOARD_NAV_ITEMS}
          activeId={activeId}
          linkComponent={RouterLinkAdapter}
          user={user?.email ? { email: user.email } : undefined}
          onSignOut={signOut}
        />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <header className="flex h-(--topbar-h) items-center gap-3 border-b border-border-subtle px-4 md:hidden">
            <SidebarMobileTrigger />
            <span className="font-display text-lg font-bold text-text-heading">
              Lurniva
            </span>
          </header>
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
