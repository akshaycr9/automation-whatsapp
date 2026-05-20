import { useMemo, useRef, useState } from "react";
import { ShellIcon } from "@/components/layout/app-shell/shell-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { TEMPLATE_CATEGORIES, TEMPLATE_STATUSES, TEMPLATE_TYPES } from "../../constants/template.constants";
import type { TemplateCategory, TemplateListFilters, TemplateStatus, TemplateType } from "../../types/template.types";
import { formatTemplateCategory, formatTemplateStatus, formatTemplateType } from "../../utils/templateFormatters";

type TemplateListToolbarProps = {
  activeStatus: TemplateStatus | "ALL";
  counts: Record<TemplateStatus | "ALL", number>;
  filters: TemplateListFilters;
  languageOptions: string[];
  onStatusChange: (status: TemplateStatus | "ALL") => void;
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: TemplateCategory | "ALL") => void;
  onLanguageChange: (languageCode: string | "ALL") => void;
  onTypeChange: (type: TemplateType | "ALL") => void;
  onResetFilters: () => void;
  onSyncTemplates: () => void;
  isSyncing?: boolean;
};

const visibleStatuses: Array<TemplateStatus | "ALL"> = ["ALL", "APPROVED", "PENDING", "REJECTED", "DRAFT", "PAUSED"];

export function TemplateListToolbar({
  activeStatus,
  counts,
  filters,
  languageOptions,
  onStatusChange,
  onSearchChange,
  onCategoryChange,
  onLanguageChange,
  onTypeChange,
  onResetFilters,
  onSyncTemplates,
  isSyncing = false
}: TemplateListToolbarProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);
  const activeFilterCount = useMemo(() => getActiveFilterCount(filters), [filters]);

  return (
    <div ref={controlsRef} className="space-y-3">
      <div
        className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Template status filters"
      >
        {visibleStatuses.map((status) => (
          <button
            key={status}
            className={cn(
              "inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition",
              activeStatus === status
                ? "border-brand/30 bg-brand-soft text-brand-hover"
                : "border-transparent text-text-muted hover:bg-surface-2 hover:text-text"
            )}
            type="button"
            aria-pressed={activeStatus === status}
            onClick={() => onStatusChange(status)}
          >
            {status === "ALL" ? "All" : formatTemplateStatus(status)}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-[11px]",
                activeStatus === status ? "bg-surface text-brand-hover" : "bg-surface-2 text-text-muted"
              )}
            >
              {counts[status] ?? 0}
            </span>
          </button>
        ))}
      </div>

      <div className="relative flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-xl">
          <label className="sr-only" htmlFor="template-search">
            Search templates
          </label>
          <ShellIcon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-subtle"
          />
          <Input
            id="template-search"
            aria-label="Search templates"
            className="pl-9"
            placeholder="Search templates..."
            value={filters.search ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
          <Button
            className={cn(
              "relative w-full sm:w-auto",
              activeFilterCount > 0 && "border-brand/40 bg-brand-soft text-brand-hover hover:bg-brand-soft"
            )}
            type="button"
            variant="secondary"
            aria-expanded={isFiltersOpen}
            aria-controls="template-filter-menu"
            onClick={() => setIsFiltersOpen((current) => !current)}
          >
            <ShellIcon name="filter" className="size-4" />
            Filters
            {activeFilterCount > 0 ? (
              <span className="grid min-w-5 place-items-center rounded-full bg-brand px-1.5 text-xs text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </Button>

          <Button
            className="w-full sm:w-auto"
            type="button"
            variant="secondary"
            disabled={isSyncing}
            onClick={onSyncTemplates}
          >
            <ShellIcon name="sync" className={cn("size-4", isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync templates"}
          </Button>
        </div>

        {isFiltersOpen ? (
          <div
            id="template-filter-menu"
            className="absolute right-0 top-[calc(100%+0.5rem)] z-20 w-full rounded-lg border border-border bg-surface p-4 shadow-xl sm:w-[28rem]"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <FilterSelect
                id="template-status"
                label="Status"
                value={filters.status ?? "ALL"}
                onChange={(value) => onStatusChange(value as TemplateStatus | "ALL")}
                options={[
                  { label: "All", value: "ALL" },
                  ...TEMPLATE_STATUSES.map((status) => ({ label: formatTemplateStatus(status), value: status }))
                ]}
              />
              <FilterSelect
                id="template-category"
                label="Category"
                value={filters.category ?? "ALL"}
                onChange={(value) => onCategoryChange(value as TemplateCategory | "ALL")}
                options={[
                  { label: "All", value: "ALL" },
                  ...TEMPLATE_CATEGORIES.map((category) => ({
                    label: formatTemplateCategory(category),
                    value: category
                  }))
                ]}
              />
              <FilterSelect
                id="template-language"
                label="Language"
                value={filters.languageCode ?? "ALL"}
                onChange={(value) => onLanguageChange(value)}
                options={[
                  { label: "All", value: "ALL" },
                  ...languageOptions.map((code) => ({ label: code, value: code }))
                ]}
              />
              <FilterSelect
                id="template-type"
                label="Type"
                value={filters.type ?? "ALL"}
                onChange={(value) => onTypeChange(value as TemplateType | "ALL")}
                options={[
                  { label: "All", value: "ALL" },
                  ...TEMPLATE_TYPES.map((type) => ({ label: formatTemplateType(type), value: type }))
                ]}
              />
            </div>
            <div className="mt-4 flex justify-end border-t border-border pt-3">
              <button
                className="min-h-9 rounded-md px-3 text-sm font-medium text-text-muted transition hover:bg-surface-2 hover:text-text"
                type="button"
                onClick={onResetFilters}
              >
                Reset
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

type FilterSelectProps = {
  id: string;
  label: string;
  value: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
};

function FilterSelect({ id, label, value, options, onChange }: FilterSelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-text-muted" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function getActiveFilterCount(filters: TemplateListFilters) {
  return [filters.status, filters.category, filters.languageCode, filters.type].filter(
    (value) => value && value !== "ALL"
  ).length;
}
