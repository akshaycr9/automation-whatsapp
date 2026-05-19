import type { TemplateValidationChecklistItem } from "../../types/template.types";

type ValidationChecklistProps = {
  items: TemplateValidationChecklistItem[];
};

export function ValidationChecklist({ items }: ValidationChecklistProps) {
  return (
    <section
      className="rounded-lg border border-border bg-surface p-4 shadow-sm"
      aria-labelledby="template-validation-title"
    >
      <h2 id="template-validation-title" className="text-base font-semibold text-text">
        Readiness checklist
      </h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-start gap-2 text-sm">
            <span
              className={item.status === "valid" ? "mt-0.5 text-brand-hover" : "mt-0.5 text-error"}
              aria-hidden="true"
            >
              {item.status === "valid" ? "✓" : "•"}
            </span>
            <span className={item.status === "valid" ? "text-text" : "text-text-muted"} title={item.message}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
