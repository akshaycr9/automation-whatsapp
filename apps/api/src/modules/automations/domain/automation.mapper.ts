import { AutomationComponentType, TemplateComponentType } from "@prisma/client";
import type {
  AutomationFlowRecord,
  AutomationRecord,
  AutomationTemplateRecord,
  RequiredAutomationVariable
} from "./automation.types.js";

export function mapAutomationFlowsToListResponse(flows: AutomationFlowRecord[]) {
  return {
    flows: flows.map((flow) => ({
      id: flow.id,
      key: flow.key,
      name: flow.name,
      description: flow.description,
      sortOrder: flow.sortOrder,
      automations: [...flow.automations]
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map((automation) => {
          const requiredVariables = extractRequiredVariables(automation.template);
          const mappedVariablesCount = countRequiredMappings(requiredVariables, automation);

          return {
            id: automation.id,
            key: automation.key,
            name: automation.name,
            description: automation.description,
            triggerSource: automation.triggerSource,
            triggerEvent: automation.triggerEvent,
            triggerButtonText: getTriggerButtonText(automation),
            isEnabled: automation.isEnabled,
            templateId: automation.templateId,
            templateName: automation.template?.displayName ?? automation.template?.name ?? null,
            delayMinutes: automation.delayMinutes,
            sortOrder: automation.sortOrder,
            isConfigured: isAutomationConfigured(automation),
            mappedVariablesCount,
            requiredVariablesCount: requiredVariables.length
          };
        })
    }))
  };
}

export function mapAutomationToDetailResponse(automation: AutomationRecord) {
  const requiredVariables = extractRequiredVariables(automation.template);

  return {
    id: automation.id,
    flow: {
      id: automation.flow.id,
      key: automation.flow.key,
      name: automation.flow.name
    },
    key: automation.key,
    name: automation.name,
    description: automation.description,
    triggerSource: automation.triggerSource,
    triggerEvent: automation.triggerEvent,
    triggerButtonText: getTriggerButtonText(automation),
    isEnabled: automation.isEnabled,
    templateId: automation.templateId,
    template: automation.template
      ? {
          id: automation.template.id,
          name: automation.template.displayName ?? automation.template.name,
          language: automation.template.languageCode,
          category: automation.template.category,
          status: automation.template.status,
          components: [...(automation.template.components ?? [])]
            .sort((left, right) => left.sortOrder - right.sortOrder)
            .map((component) => ({
              componentType: component.componentType,
              format: component.format,
              text: component.text,
              sortOrder: component.sortOrder
            })),
          variables: requiredVariables
        }
      : null,
    delayMinutes: automation.delayMinutes,
    sortOrder: automation.sortOrder,
    isConfigured: isAutomationConfigured(automation),
    requiredVariables,
    variableMappings: [...automation.variableMappings]
      .sort((left, right) =>
        left.componentType === right.componentType
          ? left.variableIndex - right.variableIndex
          : left.componentType.localeCompare(right.componentType)
      )
      .map((mapping) => ({
        id: mapping.id,
        templateVariableName: mapping.templateVariableName,
        componentType: mapping.componentType,
        variableIndex: mapping.variableIndex,
        sourceField: mapping.sourceField,
        fallbackValue: mapping.fallbackValue
      }))
  };
}

function getTriggerButtonText(automation: AutomationRecord) {
  const activeAction = automation.targetButtonActions?.find((action) => action.isActive);

  return activeAction?.buttonText ?? null;
}

export function isAutomationConfigured(automation: AutomationRecord) {
  if (!automation.templateId || !automation.template) return false;
  const requiredVariables = extractRequiredVariables(automation.template);
  if (requiredVariables.length === 0) return true;

  return requiredVariables.every((variable) =>
    automation.variableMappings.some(
      (mapping) => mapping.componentType === variable.componentType && mapping.variableIndex === variable.variableIndex
    )
  );
}

export function extractRequiredVariables(template: AutomationTemplateRecord | null): RequiredAutomationVariable[] {
  return [...(template?.variables ?? [])]
    .filter((variable) => isSupportedTemplateComponentType(variable.componentType))
    .sort((left, right) =>
      left.componentType === right.componentType
        ? left.position - right.position
        : left.componentType.localeCompare(right.componentType)
    )
    .map((variable) => {
      const componentType = mapTemplateComponentType(variable.componentType);

      return {
        templateVariableName: `${componentType.toLowerCase()}_${variable.position}`,
        componentType,
        variableIndex: variable.position,
        placeholder: variable.placeholder,
        sampleValue: variable.sampleValue,
        sourceKey: variable.sourceKey
      };
    });
}

function countRequiredMappings(requiredVariables: RequiredAutomationVariable[], automation: AutomationRecord) {
  return requiredVariables.filter((variable) =>
    automation.variableMappings.some(
      (mapping) => mapping.componentType === variable.componentType && mapping.variableIndex === variable.variableIndex
    )
  ).length;
}

function isSupportedTemplateComponentType(componentType: TemplateComponentType) {
  return (
    componentType === TemplateComponentType.HEADER ||
    componentType === TemplateComponentType.BODY ||
    componentType === TemplateComponentType.BUTTONS
  );
}

function mapTemplateComponentType(componentType: TemplateComponentType) {
  if (componentType === TemplateComponentType.HEADER) return AutomationComponentType.HEADER;
  if (componentType === TemplateComponentType.BUTTONS) return AutomationComponentType.BUTTON;
  return AutomationComponentType.BODY;
}
