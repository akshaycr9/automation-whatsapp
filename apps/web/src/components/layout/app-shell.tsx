import { NavLink, Outlet } from "react-router";
import { APP_NAME } from "@/lib/constants";

const navItems = [
  ["Dashboard", "/dashboard"],
  ["Templates", "/templates"],
  ["Automations", "/automations"],
  ["Conversations", "/conversations"],
  ["Logs", "/logs"],
  ["Settings", "/settings"]
] as const;

export function AppShell() {
  return (
    <div className="min-h-screen bg-[#f7f8f5]">
      <header className="border-b border-[#d8e0da] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <strong>{APP_NAME}</strong>
          <nav aria-label="Primary navigation" className="flex gap-2 overflow-x-auto">
            {navItems.map(([label, href]) => (
              <NavLink
                key={href}
                to={href}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm ${isActive ? "bg-[#1f6f50] text-white" : "text-[#344139] hover:bg-[#eef3ef]"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
