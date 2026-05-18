import type { TemplateListFilters } from "../../types/template.types";

type TemplateFiltersProps = {
  filters?: TemplateListFilters;
};

export function TemplateFilters({ filters }: TemplateFiltersProps) {
  const activeFilterCount = Object.values(filters ?? {}).filter(Boolean).length;

  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-4 text-sm text-text-muted">
      Template filters placeholder. Active filters: {activeFilterCount}.
    </div>
  );
}
