import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { SectionErrorBoundary } from "@/components/error-boundaries";
import { Button } from "@/components/ui/button";
import { PullToRefreshIndicator } from "@/components/ui/pull-to-refresh-indicator";
import {
  TemplateActionNotification,
  type TemplateActionNotificationState
} from "@/features/templates/components/TemplateList/TemplateActionNotification";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { ApiError } from "@/lib/api-client";
import { AutomationFlowCard } from "../components/AutomationFlowCard";
import { DesktopAutomationFlowSection, MobileAutomationFlowSection } from "../components/AutomationFlowSection";
import { useAutomations } from "../hooks/useAutomations";
import { useToggleAutomation } from "../hooks/useToggleAutomation";
import type { AutomationListItem } from "../types/automation.types";
import { summarizeAutomations } from "../utils/automation.utils";

export function AutomationsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const automationsQuery = useAutomations();
  const toggleAutomation = useToggleAutomation();
  const flows = automationsQuery.data?.flows ?? [];
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null);
  const [notification, setNotification] = useState<TemplateActionNotificationState | null>(null);
  const selectedFlow = flows.find((flow) => flow.id === (selectedFlowId ?? flows[0]?.id)) ?? flows[0];
  const summary = useMemo(() => summarizeAutomations(flows), [flows]);
  const togglingAutomationId = toggleAutomation.isPending ? (toggleAutomation.variables?.automationId ?? null) : null;
  const pullToRefresh = usePullToRefresh<HTMLElement>({
    enabled: !toggleAutomation.isPending,
    isRefreshing: automationsQuery.isFetching,
    onRefresh: async () => {
      setNotification(null);
      try {
        await automationsQuery.refetch();
        showNotification("success", "Automations refreshed.");
      } catch (error) {
        showNotification(
          "error",
          error instanceof ApiError ? error.message : "Automations could not be refreshed. Please try again."
        );
      }
    }
  });

  useEffect(() => {
    const routeNotification = (
      location.state as { automationNotification?: Omit<TemplateActionNotificationState, "id"> } | null
    )?.automationNotification;
    if (!routeNotification) return;

    setNotification({ ...routeNotification, id: Date.now() });
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  const showNotification = (variant: TemplateActionNotificationState["variant"], message: string) => {
    setNotification({ id: Date.now(), variant, message });
  };

  const handleToggle = async (automation: AutomationListItem, isEnabled: boolean) => {
    setNotification(null);
    try {
      await toggleAutomation.mutateAsync({ automationId: automation.id, isEnabled });
      showNotification("success", `${automation.name} ${isEnabled ? "enabled" : "disabled"}.`);
    } catch (error) {
      showNotification(
        "error",
        error instanceof ApiError
          ? error.message
          : "Automation cannot be enabled until a WhatsApp template and all required variables are configured."
      );
    }
  };

  return (
    <section ref={pullToRefresh.containerRef} aria-labelledby="automations-title" className="space-y-5">
      <PullToRefreshIndicator progress={pullToRefresh.progress} status={pullToRefresh.status} />

      <div>
        <h1 id="automations-title" className="text-2xl font-semibold tracking-tight text-text">
          Automations
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Configure WhatsApp messages triggered by Shopify events and customer replies.
        </p>
      </div>

      <TemplateActionNotification notification={notification} onDismiss={() => setNotification(null)} />

      <SectionErrorBoundary name="Automations List">
        {automationsQuery.isLoading ? <AutomationsLoadingState /> : null}
        {automationsQuery.isError ? <AutomationsErrorState onRetry={() => void automationsQuery.refetch()} /> : null}
        {automationsQuery.isSuccess && flows.length === 0 ? <AutomationsEmptyState /> : null}
        {automationsQuery.isSuccess && flows.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-surface p-3 shadow-sm md:hidden">
              <SummaryMetric label="Active" value={summary.activeCount} />
              <SummaryMetric label="Inactive" value={summary.inactiveCount} />
              <SummaryMetric label="Total" value={summary.totalCount} />
            </div>

            <div className="hidden gap-3 md:flex">
              {flows.map((flow) => (
                <AutomationFlowCard
                  key={flow.id}
                  flow={flow}
                  isSelected={selectedFlow?.id === flow.id}
                  onSelect={() => setSelectedFlowId(flow.id)}
                />
              ))}
            </div>

            <div className="hidden md:block">
              {selectedFlow ? (
                <DesktopAutomationFlowSection
                  flow={selectedFlow}
                  togglingAutomationId={togglingAutomationId}
                  onConfigure={(automationId) => navigate(`/automations/${automationId}`)}
                  onToggle={(automation, isEnabled) => void handleToggle(automation, isEnabled)}
                />
              ) : null}
            </div>

            <div className="space-y-3 md:hidden">
              {flows.map((flow) => (
                <MobileAutomationFlowSection
                  key={flow.id}
                  flow={flow}
                  togglingAutomationId={togglingAutomationId}
                  onConfigure={(automationId) => navigate(`/automations/${automationId}`)}
                  onToggle={(automation, isEnabled) => void handleToggle(automation, isEnabled)}
                />
              ))}
            </div>
          </>
        ) : null}
      </SectionErrorBoundary>
    </section>
  );
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-r border-border px-2 text-center last:border-r-0">
      <p className="text-xl font-semibold text-text">{value}</p>
      <p className="text-[11px] text-text-subtle">{label}</p>
    </div>
  );
}

function AutomationsLoadingState() {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-36 animate-pulse rounded-lg border border-border bg-surface-2" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-lg border border-border bg-surface-2" />
    </div>
  );
}

function AutomationsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-error/30 bg-error-soft p-5 text-sm text-text">
      <p className="font-medium text-error">Automations could not be loaded.</p>
      <p className="mt-1 text-text-muted">Please try again once the API is reachable.</p>
      <Button className="mt-4" type="button" variant="secondary" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function AutomationsEmptyState() {
  return (
    <div className="rounded-lg border border-border bg-surface px-6 py-12 text-center text-sm text-text-muted shadow-sm">
      No automations were returned by the API.
    </div>
  );
}
