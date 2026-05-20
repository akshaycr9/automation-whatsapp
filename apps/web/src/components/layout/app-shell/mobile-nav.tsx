import { NavLink } from "react-router";
import { cn } from "@/lib/utils";
import { mobileNavItems } from "./nav-items";
import { ShellIcon } from "./shell-icon";

export function MobileNav() {
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-30 grid h-mobile-nav grid-cols-5 border-t border-border bg-surface/95 px-1 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-1 shadow-[0_-10px_24px_-18px_rgba(15,23,42,0.35)] backdrop-blur md:hidden"
    >
      {mobileNavItems.map((item) => (
        <NavLink
          key={item.href}
          to={item.href}
          className={({ isActive }) =>
            cn(
              "mx-1 flex flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-text-muted transition-colors",
              "hover:bg-surface-2 hover:text-text",
              isActive && "bg-brand-soft text-brand-hover"
            )
          }
        >
          <ShellIcon name={item.icon} className="size-5.5" />
          {item.shortLabel ?? item.label}
        </NavLink>
      ))}
    </nav>
  );
}
