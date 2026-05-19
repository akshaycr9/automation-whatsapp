export type ValidationChecklistItem = {
  id: string;
  label: string;
  isValid: boolean;
};

type ValidationChecklistProps = {
  items: ValidationChecklistItem[];
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
            <span className={item.isValid ? "mt-0.5 text-brand-hover" : "mt-0.5 text-text-subtle"} aria-hidden="true">
              {item.isValid ? "✓" : "•"}
            </span>
            <span className={item.isValid ? "text-text" : "text-text-muted"}>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
