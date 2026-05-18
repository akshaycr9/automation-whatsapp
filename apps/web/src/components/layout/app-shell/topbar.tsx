import { ReactNode } from "react";
import { useLogoutMutation } from "@/features/auth/hooks/use-logout-mutation";
import { ShellIcon } from "./shell-icon";

type TopbarProps = {
  title: string;
  subtitle?: string | undefined;
  right?: ReactNode;
  backAction?: (() => void) | undefined;
};

export function Topbar({ title, subtitle, right, backAction }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-header items-center justify-between gap-3 border-b border-border bg-surface/95 px-4 backdrop-blur sm:px-5 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {backAction && (
          <button
            type="button"
            onClick={backAction}
            className="grid size-7.5 shrink-0 place-items-center rounded-md border border-border bg-surface-2 text-text-muted transition-colors hover:bg-border"
            aria-label="Go back"
          >
            <ShellIcon name="arrow-left" className="size-4" />
          </button>
        )}
        <h1 className="truncate text-lg font-semibold leading-tight text-text">{title}</h1>
        {subtitle && <span className="hidden shrink-0 text-[13px] text-text-muted sm:inline">· {subtitle}</span>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <TopbarSearch />
        {right}
        <NotificationsButton />
        <AdminAvatar />
      </div>
    </header>
  );
}

function TopbarSearch() {
  return (
    <div className="relative hidden w-70 lg:block">
      <ShellIcon
        name="search"
        className="pointer-events-none absolute left-3 top-1/2 size-3.75 -translate-y-1/2 text-text-subtle"
      />
      <input
        className="h-9 w-full rounded-md border border-transparent bg-surface-2 pl-9 pr-3 text-[13px] text-text outline-none transition focus:border-brand focus:bg-surface focus:shadow-[0_0_0_3px_rgba(34,197,94,0.14)]"
        placeholder="Search orders, customers, templates..."
        type="search"
      />
    </div>
  );
}

function NotificationsButton() {
  return (
    <button
      type="button"
      className="relative grid size-8 place-items-center rounded-md border border-border bg-surface text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
      aria-label="Notifications"
    >
      <ShellIcon name="bell" className="size-4" />
      <span
        className="absolute right-1.5 top-1.5 size-1.75 rounded-full border-2 border-surface bg-error"
        aria-hidden="true"
      />
    </button>
  );
}

function AdminAvatar() {
  const logoutMutation = useLogoutMutation();

  return (
    <button
      aria-label="Sign out"
      className="grid size-8 place-items-center rounded-full bg-brand-soft text-[13px] font-semibold text-brand-hover transition hover:bg-surface-2"
      disabled={logoutMutation.isPending}
      title="Sign out"
      type="button"
      onClick={() => logoutMutation.mutate()}
    >
      A
    </button>
  );
}
