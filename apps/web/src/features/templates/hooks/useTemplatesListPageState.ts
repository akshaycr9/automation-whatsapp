import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { TEMPLATE_STATUSES } from "../constants/template.constants";
import type { Template, TemplateListFilters, TemplateStatus } from "../types/template.types";
import { filterTemplates, hasActiveTemplateFilters } from "../utils/templateFilters";

const defaultFilters: TemplateListFilters = {
  status: "ALL",
  category: "ALL",
  languageCode: "ALL",
  type: "ALL"
};

export function useTemplatesListPageState(templates: Template[]) {
  const navigate = useNavigate();
  const [syncingTemplateId, setSyncingTemplateId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TemplateListFilters>(defaultFilters);

  const filteredTemplates = useMemo(() => filterTemplates(templates, filters), [templates, filters]);
  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? null,
    [selectedTemplateId, templates]
  );
  const hasFilters = hasActiveTemplateFilters(filters);
  const languageOptions = useMemo(
    () => [...new Set(templates.map((template) => template.languageCode))].sort(),
    [templates]
  );
  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries([
      ["ALL", templates.length],
      ...TEMPLATE_STATUSES.map((status) => [status, 0])
    ]) as Record<TemplateStatus | "ALL", number>;

    for (const template of templates) {
      counts[template.status] += 1;
    }

    return counts;
  }, [templates]);

  const updateFilters = (nextFilters: Partial<TemplateListFilters>) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
  };

  const resetFilters = () => {
    setFilters({
      ...defaultFilters,
      search: ""
    });
  };

  const createTemplate = () => navigate("/templates/create");
  const viewTemplate = (templateId: string) => setSelectedTemplateId(templateId);
  const closeTemplate = () => setSelectedTemplateId(null);

  const runPlaceholderAction = (action: string, templateId: string) => {
    if (import.meta.env.DEV) {
      console.info(`[Templates] ${action} placeholder`, { templateId });
    }
  };

  const syncTemplate = (templateId: string) => {
    runPlaceholderAction("sync", templateId);
    setSyncingTemplateId(templateId);
    window.setTimeout(() => {
      setSyncingTemplateId((currentTemplateId) => (currentTemplateId === templateId ? null : currentTemplateId));
    }, 900);
  };

  return {
    createTemplate,
    closeTemplate,
    filteredTemplates,
    filters,
    hasFilters,
    languageOptions,
    resetFilters,
    runPlaceholderAction,
    selectedTemplate,
    statusCounts,
    syncingTemplateId,
    syncTemplate,
    updateFilters,
    viewTemplate
  };
}
