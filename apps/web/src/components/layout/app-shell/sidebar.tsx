import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { navItems } from "./nav-items";
import { NavBrand } from "./nav-brand";
import { ShellIcon } from "./shell-icon";

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-sidebar flex-col border-r border-border bg-surface px-3 py-4 shadow-sm md:flex">
      <NavBrand />
      <nav aria-label="Primary navigation" className="mt-3 flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium text-text-muted transition-colors",
                "hover:bg-surface-2 hover:text-text",
                isActive && "bg-brand-soft text-brand-hover"
              )
            }
          >
            <ShellIcon name={item.icon} className="size-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <ApiHealthCard />
    </aside>
  );
}

function ApiHealthCard() {
  return (
    <div className="border-t border-border pt-4">
      <div className="flex items-center gap-2.5 rounded-md bg-surface-2 p-2">
        <span className="size-2.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-text">Cloud API healthy</p>
          <p className="truncate text-[11px] text-text-subtle">Webhooks · Shopify · WA</p>
        </div>
      </div>
    </div>
  );
}
