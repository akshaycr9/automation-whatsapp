import type { AutomationComponentType } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";

export type AutomationVariableMappingForResolve = {
  templateVariableName: string;
  componentType: AutomationComponentType;
  variableIndex: number;
  sourceField: string;
  fallbackValue: string | null;
};

export type ResolvedAutomationVariable = {
  templateVariableName: string;
  componentType: AutomationComponentType;
  variableIndex: number;
  value: string;
};

export type AutomationVariableResolutionResult =
  | { success: true; variables: ResolvedAutomationVariable[] }
  | { success: false; reason: string };

export class AutomationVariableResolverService {
  resolve(
    event: InternalAutomationEvent,
    mappings: AutomationVariableMappingForResolve[]
  ): AutomationVariableResolutionResult {
    const variables: ResolvedAutomationVariable[] = [];

    for (const mapping of mappings) {
      const value = readSourceValue(event, mapping.sourceField) ?? mapping.fallbackValue ?? undefined;

      if (!value) {
        return {
          success: false,
          reason: `Required variable ${mapping.templateVariableName} could not be resolved.`
        };
      }

      variables.push({
        templateVariableName: mapping.templateVariableName,
        componentType: mapping.componentType,
        variableIndex: mapping.variableIndex,
        value
      });
    }

    return {
      success: true,
      variables
    };
  }
}

function readSourceValue(event: InternalAutomationEvent, sourceField: string) {
  const topLevelValues: Record<string, unknown> = {
    customerPhone: event.customerPhone,
    customerEmail: event.customerEmail,
    resourceId: event.resourceId
  };
  const topLevelValue = topLevelValues[sourceField];
  if (isNonEmptyScalar(topLevelValue)) return String(topLevelValue);

  const value = sourceField.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    return (current as Record<string, unknown>)[segment];
  }, event.data);

  return isNonEmptyScalar(value) ? String(value) : undefined;
}

function isNonEmptyScalar(value: unknown) {
  return (
    (typeof value === "string" && value.trim().length > 0) || typeof value === "number" || typeof value === "boolean"
  );
}
