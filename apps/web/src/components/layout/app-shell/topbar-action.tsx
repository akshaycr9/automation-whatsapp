import { useNavigate } from "react-router";
import { ShellIcon } from "./shell-icon";

export function TopbarAction({ pathname }: { pathname: string }) {
  const navigate = useNavigate();

  if (pathname === "/templates") {
    return (
      <button
        type="button"
        onClick={() => navigate("/templates/new")}
        className="inline-flex h-7.5 items-center gap-1.5 rounded-md border border-brand bg-brand px-3 text-xs font-medium text-white shadow-sm transition hover:bg-brand-hover"
      >
        <ShellIcon name="plus" className="size-3.25" />
        <span className="hidden sm:inline">Create Template</span>
      </button>
    );
  }

  if (pathname === "/dashboard") {
    return (
      <button
        type="button"
        className="hidden h-7.5 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-medium text-text transition hover:bg-surface-2 sm:inline-flex"
      >
        <ShellIcon name="sync" className="size-3.25" />
        Refresh
      </button>
    );
  }

  return null;
}
