import type { Template, TemplateListFilters } from "../types/template.types";
import { formatTemplateCategory } from "./templateFormatters";

export function hasActiveTemplateFilters(filters: TemplateListFilters) {
  return Boolean(
    filters.search?.trim() ||
    (filters.status && filters.status !== "ALL") ||
    (filters.category && filters.category !== "ALL") ||
    (filters.languageCode && filters.languageCode !== "ALL") ||
    (filters.type && filters.type !== "ALL")
  );
}

export function filterTemplates(templates: Template[], filters: TemplateListFilters) {
  const search = filters.search?.trim().toLowerCase();

  return templates
    .filter((template) => {
      const searchable = [
        template.name,
        template.displayName,
        template.category,
        formatTemplateCategory(template.category),
        template.languageCode,
        template.type,
        template.status
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !search || searchable.includes(search);
      const matchesStatus = !filters.status || filters.status === "ALL" || template.status === filters.status;
      const matchesCategory = !filters.category || filters.category === "ALL" || template.category === filters.category;
      const matchesLanguage =
        !filters.languageCode || filters.languageCode === "ALL" || template.languageCode === filters.languageCode;
      const matchesType = !filters.type || filters.type === "ALL" || template.type === filters.type;

      return matchesSearch && matchesStatus && matchesCategory && matchesLanguage && matchesType;
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
