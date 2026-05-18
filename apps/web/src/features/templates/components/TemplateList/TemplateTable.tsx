import type { Template } from "../../types/template.types";

type TemplateTableProps = {
  templates?: Template[];
};

export function TemplateTable({ templates = [] }: TemplateTableProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface-2 p-4 text-sm text-text-muted">
      Template table placeholder. Mock records available: {templates.length}.
    </div>
  );
}
