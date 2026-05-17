import { Outlet, useLocation, useNavigate } from "react-router";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MobileNav } from "./app-shell/mobile-nav";
import { navItems, secondaryRouteMeta } from "./app-shell/nav-items";
import { Sidebar } from "./app-shell/sidebar";
import { Topbar } from "./app-shell/topbar";
import { TopbarAction } from "./app-shell/topbar-action";

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPrimary = navItems.find((item) => location.pathname.startsWith(item.href));
  const secondaryMeta = secondaryRouteMeta[location.pathname];
  const title = secondaryMeta?.title ?? currentPrimary?.title ?? APP_NAME;
  const subtitle = secondaryMeta?.subtitle ?? currentPrimary?.subtitle;

  return (
    <div className="min-h-screen bg-background text-text">
      <Sidebar />
      <div className="min-h-screen pb-mobile-nav md:pb-0 md:pl-sidebar">
        <Topbar
          title={title}
          subtitle={subtitle}
          backAction={secondaryMeta ? () => navigate(secondaryMeta.backTo) : undefined}
          right={<TopbarAction pathname={location.pathname} />}
        />
        <main
          className={cn(
            "min-h-[calc(100vh-var(--header-height))] px-4 py-5 sm:px-5 lg:px-6",
            location.pathname === "/conversations" && "overflow-hidden md:p-5.5"
          )}
        >
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
