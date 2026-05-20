import { SectionErrorBoundary } from "@/components/error-boundaries";
import { EmptyTemplatesState } from "../components/TemplateList/EmptyTemplatesState";
import { TemplateListErrorState } from "../components/TemplateList/TemplateListErrorState";
import { TemplateListHeader } from "../components/TemplateList/TemplateListHeader";
import { TemplateListSkeleton } from "../components/TemplateList/TemplateListSkeleton";
import { TemplateListToolbar } from "../components/TemplateList/TemplateListToolbar";
import { TemplateTable } from "../components/TemplateList/TemplateTable";
import { TemplateDetailModal } from "../components/TemplateList/TemplateDetailModal";
import { useDeleteTemplate } from "../hooks/useDeleteTemplate";
import { useRetryTemplateSubmission } from "../hooks/useRetryTemplateSubmission";
import { useSyncTemplate } from "../hooks/useSyncTemplate";
import { useSyncTemplates } from "../hooks/useSyncTemplates";
import { useTemplate } from "../hooks/useTemplate";
import { useTemplates } from "../hooks/useTemplates";
import { useTemplatesListPageState } from "../hooks/useTemplatesListPageState";

export function TemplatesListPage() {
  const templatesQuery = useTemplates();
  const syncTemplates = useSyncTemplates();
  const syncTemplate = useSyncTemplate();
  const retryTemplateSubmission = useRetryTemplateSubmission();
  const deleteTemplate = useDeleteTemplate();
  const templates = templatesQuery.data ?? [];
  const listState = useTemplatesListPageState(templates);
  const selectedTemplateDetail = useTemplate(listState.selectedTemplate?.id);
  const selectedTemplate = selectedTemplateDetail.data ?? listState.selectedTemplate;

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
          filters={listState.filters}
          isSyncing={syncTemplates.isPending}
          languageOptions={listState.languageOptions}
          onStatusChange={(status) => listState.updateFilters({ status })}
          onSearchChange={(search) => listState.updateFilters({ search })}
          onCategoryChange={(category) => listState.updateFilters({ category })}
          onLanguageChange={(languageCode) => listState.updateFilters({ languageCode })}
          onTypeChange={(type) => listState.updateFilters({ type })}
          onResetFilters={listState.resetFilters}
          onSyncTemplates={() => syncTemplates.mutate()}
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
            retryingTemplateId={retryTemplateSubmission.isPending ? (retryTemplateSubmission.variables ?? null) : null}
            syncingTemplateId={syncTemplate.isPending ? (syncTemplate.variables ?? null) : null}
            onViewTemplate={listState.viewTemplate}
            onSyncTemplate={(templateId) => syncTemplate.mutate(templateId)}
            onDuplicateTemplate={(templateId) => listState.runPlaceholderAction("duplicate", templateId)}
            onRetrySubmission={(templateId) => retryTemplateSubmission.mutate(templateId)}
            onDeleteTemplate={(templateId) => {
              if (window.confirm("Delete this template locally?")) {
                deleteTemplate.mutate(templateId);
              }
            }}
          />
        ) : null}
      </SectionErrorBoundary>

      <TemplateDetailModal
        isLoading={selectedTemplateDetail.isLoading}
        template={selectedTemplate}
        onClose={listState.closeTemplate}
      />
    </section>
  );
}

export const TemplatesPage = TemplatesListPage;
