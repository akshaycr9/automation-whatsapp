import type { AutomationVariableMapping, AutomationRequiredVariable } from "../types/automation.types";

export function validateDelayMinutes(value: number) {
  if (!Number.isInteger(value) || value < 0) {
    return "Delay must be a non-negative whole number.";
  }

  if (value > 43_200) {
    return "Delay must be 43,200 minutes or less.";
  }

  return null;
}

export function validateMappingsForEnable(
  templateId: string | null,
  requiredVariables: AutomationRequiredVariable[],
  mappings: AutomationVariableMapping[]
) {
  if (!templateId) {
    return "Select a WhatsApp template before enabling this automation.";
  }

  const missingVariable = requiredVariables.find(
    (variable) =>
      !mappings.some(
        (mapping) =>
          mapping.componentType === variable.componentType &&
          mapping.variableIndex === variable.variableIndex &&
          mapping.sourceField
      )
  );

  if (missingVariable) {
    return "Map every required template variable before enabling this automation.";
  }

  return null;
}
