import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SectionErrorBoundary } from "@/components/error-boundaries";
import type { TemplateActionNotificationState } from "../components/TemplateList/TemplateActionNotification";
import { TemplateActionNotification } from "../components/TemplateList/TemplateActionNotification";
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
import {
  buildBulkSyncMessage,
  buildTemplateStatusMessage,
  getTemplateActionErrorMessage
} from "../utils/templateActionMessages";

type TemplateLocationState = {
  templateNotification?: Omit<TemplateActionNotificationState, "id">;
};

export function TemplatesListPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const templatesQuery = useTemplates();
  const syncTemplates = useSyncTemplates();
  const syncTemplate = useSyncTemplate();
  const retryTemplateSubmission = useRetryTemplateSubmission();
  const deleteTemplate = useDeleteTemplate();
  const templates = templatesQuery.data ?? [];
  const listState = useTemplatesListPageState(templates);
  const selectedTemplateDetail = useTemplate(listState.selectedTemplate?.id);
  const selectedTemplate = selectedTemplateDetail.data ?? listState.selectedTemplate;
  const [notification, setNotification] = useState<TemplateActionNotificationState | null>(null);

  useEffect(() => {
    const routeNotification = (location.state as TemplateLocationState | null)?.templateNotification;
    if (!routeNotification) return;

    setNotification({ ...routeNotification, id: Date.now() });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const showNotification = (nextNotification: Omit<TemplateActionNotificationState, "id">) => {
    setNotification({ ...nextNotification, id: Date.now() });
  };

  const clearNotification = () => setNotification(null);

  const handleBulkSync = async () => {
    clearNotification();
    try {
      const response = await syncTemplates.mutateAsync();
      showNotification({ variant: "success", message: buildBulkSyncMessage(response.data) });
    } catch (error) {
      showNotification({
        variant: "error",
        message: getTemplateActionErrorMessage(error, "Templates could not be synced. Please try again.")
      });
    }
  };

  const handleRowSync = async (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    clearNotification();
    try {
      const response = await syncTemplate.mutateAsync(templateId);
      showNotification({ variant: "success", message: buildTemplateStatusMessage(response.data, "synced") });
    } catch (error) {
      const name = template?.displayName ?? "Template";
      showNotification({
        variant: "error",
        message: `${name} could not be synced: ${getTemplateActionErrorMessage(error, "Please try again.")}`
      });
    }
  };

  const handleRetrySubmission = async (templateId: string) => {
    const template = templates.find((item) => item.id === templateId);
    clearNotification();
    try {
      const response = await retryTemplateSubmission.mutateAsync(templateId);
      showNotification({ variant: "success", message: buildTemplateStatusMessage(response.data, "resubmitted") });
    } catch (error) {
      const name = template?.displayName ?? "Template";
      showNotification({
        variant: "error",
        message: `${name} could not be resubmitted: ${getTemplateActionErrorMessage(error, "Please try again.")}`
      });
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    clearNotification();
    if (!window.confirm("Delete this template locally?")) return;

    try {
      await deleteTemplate.mutateAsync(templateId);
      showNotification({ variant: "success", message: "Template deleted locally." });
    } catch (error) {
      showNotification({
        variant: "error",
        message: getTemplateActionErrorMessage(error, "Template could not be deleted. Please try again.")
      });
    }
  };

  return (
    <section aria-labelledby="templates-list-title" className="space-y-4">
      <TemplateListHeader
        totalCount={templates.length}
        filteredCount={listState.filteredTemplates.length}
        onCreateTemplate={listState.createTemplate}
      />

      <TemplateActionNotification notification={notification} onDismiss={clearNotification} />

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
          onSyncTemplates={() => void handleBulkSync()}
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
            onSyncTemplate={(templateId) => void handleRowSync(templateId)}
            onDuplicateTemplate={(templateId) => listState.runPlaceholderAction("duplicate", templateId)}
            onRetrySubmission={(templateId) => void handleRetrySubmission(templateId)}
            onDeleteTemplate={(templateId) => void handleDeleteTemplate(templateId)}
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
