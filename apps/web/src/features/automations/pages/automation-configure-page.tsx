import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { SectionErrorBoundary } from "@/components/error-boundaries";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  TemplateActionNotification,
  type TemplateActionNotificationState
} from "@/features/templates/components/TemplateList/TemplateActionNotification";
import { useTemplate } from "@/features/templates/hooks/useTemplate";
import { useTemplates } from "@/features/templates/hooks/useTemplates";
import { ApiError } from "@/lib/api-client";
import { AutomationConfiguredBadge } from "../components/AutomationBadges";
import { AutomationConditionsCard } from "../components/AutomationConditionsCard";
import { AutomationDelayField } from "../components/AutomationDelayField";
import { AutomationIcon } from "../components/AutomationIcon";
import { AutomationPreviewPanel } from "../components/AutomationPreviewPanel";
import { AutomationSwitch } from "../components/AutomationSwitch";
import { AutomationTemplateSelector } from "../components/AutomationTemplateSelector";
import { AutomationVariableMapping } from "../components/AutomationVariableMapping";
import { useAutomation } from "../hooks/useAutomation";
import { useAutomationFieldOptions } from "../hooks/useAutomationFieldOptions";
import { useToggleAutomation } from "../hooks/useToggleAutomation";
import { useUpdateAutomation } from "../hooks/useUpdateAutomation";
import type {
  AutomationDetail,
  AutomationRequiredVariable,
  AutomationVariableMapping as Mapping
} from "../types/automation.types";
import { formatTrigger, getAutomationIcon } from "../utils/automation.utils";
import { validateDelayMinutes, validateMappingsForEnable } from "../utils/automation-validation.utils";

export function AutomationConfigurePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const automationQuery = useAutomation(id);
  const fieldOptionsQuery = useAutomationFieldOptions(id);
  const templatesQuery = useTemplates({ status: "APPROVED" });
  const updateAutomation = useUpdateAutomation(id ?? "");
  const toggleAutomation = useToggleAutomation(id);
  const automation = automationQuery.data;
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [notification, setNotification] = useState<TemplateActionNotificationState | null>(null);
  const [delayError, setDelayError] = useState<string | null>(null);
  const selectedTemplateQuery = useTemplate(templateId ?? undefined);
  const selectedTemplate = selectedTemplateQuery.data;

  useEffect(() => {
    if (!automation) return;
    setTemplateId(automation.templateId);
    setDelayMinutes(automation.delayMinutes);
    setMappings(automation.variableMappings);
    setDelayError(null);
  }, [automation]);

  const requiredVariables = useMemo(
    () => getRequiredVariablesForSelectedTemplate(automation, templateId, selectedTemplate),
    [automation, selectedTemplate, templateId]
  );

  const previewAutomation = useMemo(() => {
    if (!automation) return null;
    return buildPreviewAutomation(automation, templateId, selectedTemplate, requiredVariables);
  }, [automation, requiredVariables, selectedTemplate, templateId]);

  const showNotification = (variant: TemplateActionNotificationState["variant"], message: string) => {
    setNotification({ id: Date.now(), variant, message });
  };

  const handleTemplateChange = (nextTemplateId: string | null) => {
    setTemplateId(nextTemplateId);
    setMappings([]);
  };

  const handleSave = async () => {
    if (!automation || !id) return;
    const nextDelayError = validateDelayMinutes(delayMinutes);
    setDelayError(nextDelayError);
    if (nextDelayError) return;

    setNotification(null);
    try {
      await updateAutomation.mutateAsync({
        templateId,
        delayMinutes,
        variableMappings: templateId
          ? mappings
              .filter((mapping) => mapping.sourceField)
              .map(({ templateVariableName, componentType, variableIndex, sourceField, fallbackValue }) => ({
                templateVariableName,
                componentType,
                variableIndex,
                sourceField,
                fallbackValue
              }))
          : []
      });
      navigate("/automations", {
        state: {
          automationNotification: {
            variant: "success",
            message: "Automation configuration saved."
          }
        }
      });
    } catch (error) {
      showNotification("error", getAutomationErrorMessage(error, "Automation could not be saved."));
    }
  };

  const handleToggle = async (isEnabled: boolean) => {
    if (!automation || !id) return;
    const frontendError = isEnabled ? validateMappingsForEnable(templateId, requiredVariables, mappings) : null;

    if (frontendError) {
      showNotification("error", frontendError);
      return;
    }

    setNotification(null);
    try {
      if (hasUnsavedChanges(automation, templateId, delayMinutes, mappings)) {
        await handleSave();
      }
      await toggleAutomation.mutateAsync({ automationId: id, isEnabled });
      showNotification("success", `${automation.name} ${isEnabled ? "enabled" : "disabled"}.`);
    } catch (error) {
      showNotification(
        "error",
        getAutomationErrorMessage(
          error,
          "Automation cannot be enabled until a WhatsApp template and all required variables are configured."
        )
      );
    }
  };

  if (!id) {
    return <EditErrorState message="Automation id is missing." onBack={() => navigate("/automations")} />;
  }

  if (automationQuery.isLoading) {
    return <EditLoadingState />;
  }

  if (automationQuery.isError || !automation || !previewAutomation) {
    return <EditErrorState message="Automation could not be loaded." onBack={() => navigate("/automations")} />;
  }

  return (
    <section aria-labelledby="automation-configure-title" className="space-y-5">
      <div className="space-y-4">
        <nav aria-label="Automation breadcrumb" className="flex flex-wrap items-center gap-2 text-sm font-medium">
          <button
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-text-muted shadow-sm transition hover:bg-surface-2 hover:text-text"
            type="button"
            onClick={() => navigate("/automations")}
          >
            <AutomationIcon className="size-4" name="arrow" />
            Automations
          </button>
          <span aria-hidden="true" className="text-text-subtle">
            /
          </span>
          <span className="rounded-md bg-brand-soft px-3 py-1.5 text-brand-hover">{automation.flow.name}</span>
          <span aria-hidden="true" className="text-text-subtle">
            /
          </span>
          <span className="rounded-md bg-surface-2 px-3 py-1.5 text-text">{automation.name}</span>
        </nav>
        <div>
          <h1 id="automation-configure-title" className="text-2xl font-semibold tracking-tight text-text">
            Configure {automation.name}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-text-muted">{automation.description}</p>
        </div>
      </div>

      <TemplateActionNotification notification={notification} onDismiss={() => setNotification(null)} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <SectionErrorBoundary name="Automation Overview">
            <Card className="space-y-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-hover">
                    <AutomationIcon className="size-5" name={getAutomationIcon(automation.key)} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-text">{automation.name}</h2>
                    <p className="mt-1 text-sm text-text-muted">{automation.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-text-muted">
                        {automation.flow.name}
                      </span>
                      <span className="rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-[11px] text-text-muted">
                        {formatTrigger(automation.triggerSource, automation.triggerEvent)}
                      </span>
                      {automation.triggerButtonText ? (
                        <span className="rounded-md bg-info-soft px-2 py-1 text-xs font-medium text-[#1d4ed8]">
                          Trigger button: {automation.triggerButtonText}
                        </span>
                      ) : null}
                      <AutomationConfiguredBadge isConfigured={automation.isConfigured} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AutomationSwitch
                    checked={automation.isEnabled}
                    disabled={toggleAutomation.isPending || updateAutomation.isPending}
                    label={`${automation.isEnabled ? "Disable" : "Enable"} ${automation.name}`}
                    onChange={(nextEnabled) => void handleToggle(nextEnabled)}
                  />
                </div>
              </div>
            </Card>
          </SectionErrorBoundary>

          <SectionErrorBoundary name="Automation Timing">
            <Card className="space-y-4">
              <h2 className="text-sm font-semibold text-text">Timing</h2>
              <AutomationDelayField value={delayMinutes} error={delayError} onChange={setDelayMinutes} />
            </Card>
          </SectionErrorBoundary>

          <SectionErrorBoundary name="Template and Variables">
            <Card className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-text">Template & Variables</h2>
                <p className="mt-1 text-xs text-text-muted">
                  Choose the approved WhatsApp template and map each variable to an internal event field.
                </p>
              </div>
              <AutomationTemplateSelector
                disabled={templatesQuery.isLoading}
                templates={templatesQuery.data ?? []}
                value={templateId}
                onChange={handleTemplateChange}
              />
              {previewAutomation.template ? (
                <div className="grid gap-2 rounded-lg border border-border bg-surface-2 p-3 text-xs text-text-muted sm:grid-cols-3">
                  <span>
                    Name: <strong className="text-text">{previewAutomation.template.name}</strong>
                  </span>
                  <span>
                    Language: <strong className="text-text">{previewAutomation.template.language}</strong>
                  </span>
                  <span>
                    Status: <strong className="text-text">{previewAutomation.template.status ?? "APPROVED"}</strong>
                  </span>
                </div>
              ) : null}
              {fieldOptionsQuery.isLoading ? (
                <div className="h-24 animate-pulse rounded-lg bg-surface-2" />
              ) : (
                <AutomationVariableMapping
                  fieldGroups={fieldOptionsQuery.data?.groups ?? []}
                  mappings={mappings}
                  requiredVariables={requiredVariables}
                  onChange={setMappings}
                />
              )}
            </Card>
          </SectionErrorBoundary>

          <SectionErrorBoundary name="Automation Conditions">
            <AutomationConditionsCard automation={automation} />
          </SectionErrorBoundary>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              className="w-full border-border bg-surface-2 text-text hover:bg-border sm:w-auto"
              type="button"
              variant="secondary"
              onClick={() => navigate("/automations")}
            >
              Cancel
            </Button>
            <Button
              className="w-full sm:w-auto"
              disabled={updateAutomation.isPending}
              type="button"
              onClick={() => void handleSave()}
            >
              {updateAutomation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </div>
        </div>

        <SectionErrorBoundary name="Automation Preview">
          <AutomationPreviewPanel automation={previewAutomation} mappings={mappings} />
        </SectionErrorBoundary>
      </div>
    </section>
  );
}

function getRequiredVariablesForSelectedTemplate(
  automation: AutomationDetail | undefined,
  templateId: string | null,
  selectedTemplate: ReturnType<typeof useTemplate>["data"]
): AutomationRequiredVariable[] {
  if (!automation || !templateId) return [];
  if (templateId === automation.templateId) return automation.requiredVariables;

  const variables =
    selectedTemplate?.components?.flatMap((component) =>
      (component.variables ?? []).flatMap((variable) => {
        const componentType = mapComponentType(component.type);
        if (componentType === "UNSUPPORTED") return [];

        return [
          {
            templateVariableName: `${componentType.toLowerCase()}_${variable.index}`,
            componentType,
            variableIndex: variable.index,
            placeholder: variable.token,
            sampleValue: variable.sampleValue ?? variable.token,
            sourceKey: null
          }
        ];
      })
    ) ?? [];

  return variables;
}

function buildPreviewAutomation(
  automation: AutomationDetail,
  templateId: string | null,
  selectedTemplate: ReturnType<typeof useTemplate>["data"],
  requiredVariables: AutomationRequiredVariable[]
): AutomationDetail {
  if (!templateId || templateId === automation.templateId || !selectedTemplate) {
    return { ...automation, templateId, requiredVariables };
  }

  return {
    ...automation,
    templateId,
    template: {
      id: selectedTemplate.id,
      name: selectedTemplate.displayName ?? selectedTemplate.name,
      language: selectedTemplate.languageCode,
      category: selectedTemplate.category,
      status: selectedTemplate.status,
      ...(selectedTemplate.components ? { components: selectedTemplate.components } : {}),
      variables: requiredVariables
    },
    requiredVariables
  };
}

function mapComponentType(componentType: string) {
  if (componentType === "HEADER") return "HEADER" as const;
  if (componentType === "BUTTONS") return "BUTTON" as const;
  if (componentType === "BODY") return "BODY" as const;
  return "UNSUPPORTED" as const;
}

function hasUnsavedChanges(
  automation: AutomationDetail,
  templateId: string | null,
  delayMinutes: number,
  mappings: Mapping[]
) {
  return (
    automation.templateId !== templateId ||
    automation.delayMinutes !== delayMinutes ||
    JSON.stringify(automation.variableMappings) !== JSON.stringify(mappings)
  );
}

function getAutomationErrorMessage(error: unknown, fallback: string) {
  return error instanceof ApiError ? error.message : fallback;
}

function EditLoadingState() {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div className="h-40 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-28 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-72 animate-pulse rounded-lg bg-surface-2" />
      </div>
      <div className="h-[520px] animate-pulse rounded-lg bg-surface-2" />
    </div>
  );
}

function EditErrorState({ message, onBack }: { message: string; onBack: () => void }) {
  return (
    <div className="rounded-lg border border-error/30 bg-error-soft p-5 text-sm text-text">
      <p className="font-medium text-error">{message}</p>
      <Button className="mt-4" type="button" variant="secondary" onClick={onBack}>
        Back to Automations
      </Button>
    </div>
  );
}
