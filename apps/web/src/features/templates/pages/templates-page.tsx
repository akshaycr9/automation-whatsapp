import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { SectionErrorBoundary } from "@/components/error-boundaries";
import { EmptyTemplatesState } from "../components/TemplateList/EmptyTemplatesState";
import { TemplateFilters } from "../components/TemplateList/TemplateFilters";
import { TemplateListErrorState } from "../components/TemplateList/TemplateListErrorState";
import { TemplateListHeader } from "../components/TemplateList/TemplateListHeader";
import { TemplateListSkeleton } from "../components/TemplateList/TemplateListSkeleton";
import { TemplateListToolbar } from "../components/TemplateList/TemplateListToolbar";
import { TemplateTable } from "../components/TemplateList/TemplateTable";
import { TEMPLATE_STATUSES } from "../constants/template.constants";
import { useSyncTemplates } from "../hooks/useSyncTemplates";
import { useTemplates } from "../hooks/useTemplates";
import type { TemplateListFilters, TemplateStatus } from "../types/template.types";
import { filterTemplates, hasActiveTemplateFilters } from "../utils/templateFilters";

export function TemplatesListPage() {
  const navigate = useNavigate();
  const [syncingTemplateId, setSyncingTemplateId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TemplateListFilters>({
    status: "ALL",
    category: "ALL",
    languageCode: "ALL",
    type: "ALL"
  });
  const templatesQuery = useTemplates();
  const syncTemplates = useSyncTemplates();

  const templates = templatesQuery.data ?? [];
  const filteredTemplates = useMemo(() => filterTemplates(templates, filters), [templates, filters]);
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
      search: "",
      status: "ALL",
      category: "ALL",
      languageCode: "ALL",
      type: "ALL"
    });
  };

  const createTemplate = () => navigate("/templates/create");
  const viewTemplate = (templateId: string) => navigate(`/templates/${templateId}`);

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

  return (
    <section aria-labelledby="templates-list-title" className="space-y-4">
      <TemplateListHeader
        totalCount={templates.length}
        filteredCount={filteredTemplates.length}
        onCreateTemplate={createTemplate}
      />

      <SectionErrorBoundary name="Template Filters">
        <TemplateListToolbar
          activeStatus={filters.status ?? "ALL"}
          counts={statusCounts}
          isSyncing={syncTemplates.isPending}
          onStatusChange={(status) => updateFilters({ status })}
          onSyncTemplates={() => syncTemplates.mutate()}
        />
        <TemplateFilters
          filters={filters}
          languageOptions={languageOptions}
          onSearchChange={(search) => updateFilters({ search })}
          onStatusChange={(status) => updateFilters({ status })}
          onCategoryChange={(category) => updateFilters({ category })}
          onLanguageChange={(languageCode) => updateFilters({ languageCode })}
          onTypeChange={(type) => updateFilters({ type })}
          onResetFilters={resetFilters}
        />
      </SectionErrorBoundary>

      <SectionErrorBoundary name="Templates List">
        {templatesQuery.isLoading ? <TemplateListSkeleton /> : null}
        {templatesQuery.isError ? <TemplateListErrorState onRetry={() => void templatesQuery.refetch()} /> : null}
        {templatesQuery.isSuccess && filteredTemplates.length === 0 ? (
          <EmptyTemplatesState
            hasFilters={hasFilters}
            onClearFilters={resetFilters}
            onCreateTemplate={createTemplate}
          />
        ) : null}
        {templatesQuery.isSuccess && filteredTemplates.length > 0 ? (
          <TemplateTable
            templates={filteredTemplates}
            syncingTemplateId={syncingTemplateId}
            onViewTemplate={viewTemplate}
            onSyncTemplate={syncTemplate}
            onDuplicateTemplate={(templateId) => runPlaceholderAction("duplicate", templateId)}
            onDeleteTemplate={(templateId) => runPlaceholderAction("delete", templateId)}
          />
        ) : null}
      </SectionErrorBoundary>
    </section>
  );
}

export const TemplatesPage = TemplatesListPage;
