import type { Template } from "@/features/templates/types/template.types";

type AutomationTemplateSelectorProps = {
  templates: Template[];
  value: string | null;
  disabled?: boolean;
  onChange: (templateId: string | null) => void;
};

export function AutomationTemplateSelector({ templates, value, disabled, onChange }: AutomationTemplateSelectorProps) {
  const approvedTemplates = templates.filter((template) => template.status === "APPROVED");

  return (
    <label className="block">
      <span className="text-xs font-medium text-text-muted">Approved template</span>
      <select
        className="mt-1 block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={disabled}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value || null)}
      >
        <option value="">No template selected</option>
        {approvedTemplates.map((template) => (
          <option key={template.id} value={template.id}>
            {template.displayName ?? template.name} · {template.languageCode}
          </option>
        ))}
      </select>
      <span className="mt-1 block text-xs text-text-subtle">Only Meta-approved templates are listed.</span>
    </label>
  );
}
