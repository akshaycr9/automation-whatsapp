import { Input } from "@/components/ui/input";
import { TEMPLATE_CATEGORIES, TEMPLATE_STATUSES, TEMPLATE_TYPES } from "../../constants/template.constants";
import type { TemplateCategory, TemplateListFilters, TemplateStatus, TemplateType } from "../../types/template.types";
import { formatTemplateCategory, formatTemplateStatus, formatTemplateType } from "../../utils/templateFormatters";

type TemplateFiltersProps = {
  filters: TemplateListFilters;
  languageOptions: string[];
  onSearchChange: (search: string) => void;
  onStatusChange: (status: TemplateStatus | "ALL") => void;
  onCategoryChange: (category: TemplateCategory | "ALL") => void;
  onLanguageChange: (languageCode: string | "ALL") => void;
  onTypeChange: (type: TemplateType | "ALL") => void;
  onResetFilters: () => void;
};

export function TemplateFilters({
  filters,
  languageOptions,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onLanguageChange,
  onTypeChange,
  onResetFilters
}: TemplateFiltersProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_repeat(4,minmax(130px,0.7fr))_auto]">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-text-muted" htmlFor="template-search">
            Search templates
          </label>
          <Input
            id="template-search"
            aria-label="Search templates"
            placeholder="Search name, category, language..."
            value={filters.search ?? ""}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

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
            ...TEMPLATE_CATEGORIES.map((category) => ({ label: formatTemplateCategory(category), value: category }))
          ]}
        />
        <FilterSelect
          id="template-language"
          label="Language"
          value={filters.languageCode ?? "ALL"}
          onChange={(value) => onLanguageChange(value)}
          options={[{ label: "All", value: "ALL" }, ...languageOptions.map((code) => ({ label: code, value: code }))]}
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

        <div className="flex items-end">
          <button
            className="min-h-10 rounded-md px-3 text-sm font-medium text-text-muted transition hover:bg-surface-2 hover:text-text"
            type="button"
            onClick={onResetFilters}
          >
            Reset
          </button>
        </div>
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
