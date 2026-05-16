export function CreateTemplatePage() {
  return (
    <section
      aria-labelledby="create-template-title"
      className="rounded-lg border border-border bg-surface p-5 shadow-sm"
    >
      <h2 id="create-template-title" className="text-xl font-semibold text-text">
        Create Template
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-text-muted">
        Template submission UI placeholder. The production form will use React Hook Form and Zod when the template
        feature phase is approved.
      </p>
    </section>
  );
}
