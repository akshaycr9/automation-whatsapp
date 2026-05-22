import { Input } from "@/components/ui/input";
import type {
  AutomationFieldOptionGroup,
  AutomationRequiredVariable,
  AutomationVariableMapping
} from "../types/automation.types";

type AutomationVariableMappingProps = {
  requiredVariables: AutomationRequiredVariable[];
  mappings: AutomationVariableMapping[];
  fieldGroups: AutomationFieldOptionGroup[];
  onChange: (mappings: AutomationVariableMapping[]) => void;
};

export function AutomationVariableMapping({
  requiredVariables,
  mappings,
  fieldGroups,
  onChange
}: AutomationVariableMappingProps) {
  if (requiredVariables.length === 0) {
    return (
      <div className="rounded-md border border-success/30 bg-success-soft px-4 py-3 text-sm text-text">
        This template has no dynamic variables.
      </div>
    );
  }

  const updateMapping = (
    variable: AutomationRequiredVariable,
    patch: Partial<Pick<AutomationVariableMapping, "sourceField" | "fallbackValue">>
  ) => {
    const existing = mappings.find(
      (mapping) => mapping.componentType === variable.componentType && mapping.variableIndex === variable.variableIndex
    );
    const nextMapping: AutomationVariableMapping = {
      templateVariableName: variable.templateVariableName,
      componentType: variable.componentType,
      variableIndex: variable.variableIndex,
      sourceField: existing?.sourceField ?? "",
      fallbackValue: existing?.fallbackValue ?? null,
      ...(existing?.id ? { id: existing.id } : {}),
      ...patch
    };
    const withoutExisting = mappings.filter(
      (mapping) =>
        !(mapping.componentType === variable.componentType && mapping.variableIndex === variable.variableIndex)
    );

    onChange([...withoutExisting, nextMapping]);
  };

  return (
    <div className="space-y-3">
      {requiredVariables.map((variable) => {
        const mapping = mappings.find(
          (item) => item.componentType === variable.componentType && item.variableIndex === variable.variableIndex
        );

        return (
          <div
            key={`${variable.componentType}-${variable.variableIndex}`}
            className="grid gap-3 rounded-lg border border-border bg-surface p-3 sm:grid-cols-[140px_minmax(0,1fr)_minmax(180px,0.7fr)] sm:items-end"
          >
            <div>
              <span className="inline-flex rounded-md bg-brand-soft px-2 py-1 font-mono text-xs text-brand-hover">
                {variable.placeholder || variable.templateVariableName}
              </span>
              <p className="mt-2 text-xs text-text-muted">
                {variable.componentType} · {variable.templateVariableName}
              </p>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-text-muted">Source field</span>
              <select
                className="mt-1 block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
                value={mapping?.sourceField ?? ""}
                onChange={(event) => updateMapping(variable, { sourceField: event.target.value })}
              >
                <option value="">Select source field</option>
                {fieldGroups.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-text-muted">Fallback value</span>
              <Input
                className="mt-1"
                placeholder={variable.sampleValue || "Optional fallback"}
                value={mapping?.fallbackValue ?? ""}
                onChange={(event) => updateMapping(variable, { fallbackValue: event.target.value || null })}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
}
