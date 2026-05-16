import { APP_NAME } from "@/lib/constants";

export function NavBrand() {
  return (
    <div className="flex items-center gap-3 px-2 py-2">
      <div className="grid size-9 place-items-center rounded-md bg-dark-accent text-base font-semibold text-white shadow-sm">
        Q
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-text">{APP_NAME}</p>
        <p className="truncate text-xs text-text-muted">qwertees.in</p>
      </div>
    </div>
  );
}
