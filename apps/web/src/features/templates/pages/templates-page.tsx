import { SectionErrorBoundary } from "@/components/error-boundaries";
import { EmptyTemplatesState } from "../components/TemplateList/EmptyTemplatesState";
import { TemplateFilters } from "../components/TemplateList/TemplateFilters";
import { TemplateListErrorState } from "../components/TemplateList/TemplateListErrorState";
import { TemplateListHeader } from "../components/TemplateList/TemplateListHeader";
import { TemplateListSkeleton } from "../components/TemplateList/TemplateListSkeleton";
import { TemplateListToolbar } from "../components/TemplateList/TemplateListToolbar";
import { TemplateTable } from "../components/TemplateList/TemplateTable";
import { useSyncTemplates } from "../hooks/useSyncTemplates";
import { useTemplates } from "../hooks/useTemplates";
import { useTemplatesListPageState } from "../hooks/useTemplatesListPageState";

export function TemplatesListPage() {
  const templatesQuery = useTemplates();
  const syncTemplates = useSyncTemplates();
  const templates = templatesQuery.data ?? [];
  const listState = useTemplatesListPageState(templates);

  return (
    <section aria-labelledby="templates-list-title" className="space-y-4">
      <TemplateListHeader
        totalCount={templates.length}
        filteredCount={listState.filteredTemplates.length}
        onCreateTemplate={listState.createTemplate}
      />

      <SectionErrorBoundary name="Template Filters">
        <TemplateListToolbar
          activeStatus={listState.filters.status ?? "ALL"}
          counts={listState.statusCounts}
          isSyncing={syncTemplates.isPending}
          onStatusChange={(status) => listState.updateFilters({ status })}
          onSyncTemplates={() => syncTemplates.mutate()}
        />
        <TemplateFilters
          filters={listState.filters}
          languageOptions={listState.languageOptions}
          onSearchChange={(search) => listState.updateFilters({ search })}
          onStatusChange={(status) => listState.updateFilters({ status })}
          onCategoryChange={(category) => listState.updateFilters({ category })}
          onLanguageChange={(languageCode) => listState.updateFilters({ languageCode })}
          onTypeChange={(type) => listState.updateFilters({ type })}
          onResetFilters={listState.resetFilters}
        />
      </SectionErrorBoundary>

      <SectionErrorBoundary name="Templates List">
        {templatesQuery.isLoading ? <TemplateListSkeleton /> : null}
        {templatesQuery.isError ? <TemplateListErrorState onRetry={() => void templatesQuery.refetch()} /> : null}
        {templatesQuery.isSuccess && listState.filteredTemplates.length === 0 ? (
          <EmptyTemplatesState
            hasFilters={listState.hasFilters}
            onClearFilters={listState.resetFilters}
            onCreateTemplate={listState.createTemplate}
          />
        ) : null}
        {templatesQuery.isSuccess && listState.filteredTemplates.length > 0 ? (
          <TemplateTable
            templates={listState.filteredTemplates}
            syncingTemplateId={listState.syncingTemplateId}
            onViewTemplate={listState.viewTemplate}
            onSyncTemplate={listState.syncTemplate}
            onDuplicateTemplate={(templateId) => listState.runPlaceholderAction("duplicate", templateId)}
            onDeleteTemplate={(templateId) => listState.runPlaceholderAction("delete", templateId)}
          />
        ) : null}
      </SectionErrorBoundary>
    </section>
  );
}

export const TemplatesPage = TemplatesListPage;
