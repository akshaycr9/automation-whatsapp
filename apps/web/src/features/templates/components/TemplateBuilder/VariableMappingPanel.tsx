import type { TemplateVariable } from "../../types/template.types";

type VariableMappingPanelProps = {
  variables: TemplateVariable[];
  sampleValues: Record<string, string>;
  onSampleValueChange: (token: string, value: string) => void;
  errors?: Record<string, string[]>;
};

export function VariableMappingPanel({
  variables,
  sampleValues,
  onSampleValueChange,
  errors = {}
}: VariableMappingPanelProps) {
  return (
    <section
      className="rounded-lg border border-border bg-surface p-4 shadow-sm"
      aria-labelledby="template-variables-title"
    >
      <h2 id="template-variables-title" className="text-base font-semibold text-text">
        Variable samples
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        Add sample values so the preview and future Meta submission have examples.
      </p>
      {variables.length === 0 ? (
        <p className="mt-4 rounded-md bg-surface-2 p-3 text-sm text-text-subtle">No variables detected yet.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {variables.map((variable) => (
            <div key={variable.token} className="grid gap-3 md:grid-cols-[90px_1fr_1fr] md:items-center">
              <div className="rounded-md bg-brand-soft px-3 py-2 text-center font-mono text-xs font-semibold text-brand-hover">
                {variable.token}
              </div>
              <input
                className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
                value={`Variable ${variable.index}`}
                disabled
                aria-label={`Label for ${variable.token}`}
              />
              <input
                className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none"
                value={sampleValues[variable.token] ?? ""}
                placeholder={`Sample for ${variable.token}`}
                onChange={(event) => onSampleValueChange(variable.token, event.target.value)}
                aria-label={`Sample value for ${variable.token}`}
              />
              {errors[`variables.${variable.token}`]?.[0] ? (
                <p className="text-xs text-error md:col-start-3">{errors[`variables.${variable.token}`]?.[0]}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
