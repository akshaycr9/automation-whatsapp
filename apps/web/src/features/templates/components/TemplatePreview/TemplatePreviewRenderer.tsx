import type { CreateTemplateFormValues } from "../../types/template.types";
import { TemplatePreview } from "./TemplatePreview";

type TemplatePreviewRendererProps = {
  formValues: CreateTemplateFormValues;
};

export function TemplatePreviewRenderer({ formValues }: TemplatePreviewRendererProps) {
  if (formValues.type !== "TEXT") {
    return (
      <aside className="rounded-lg border border-border bg-surface p-4 shadow-sm">
        <h2 className="text-base font-semibold text-text">Preview coming soon</h2>
        <p className="mt-1 text-sm text-text-muted">Only text template previews are available in this phase.</p>
      </aside>
    );
  }

  return (
    <TemplatePreview
      headerFormat={formValues.headerFormat}
      headerText={formValues.headerText ?? ""}
      bodyText={formValues.bodyText}
      footerText={formValues.footerText ?? ""}
      buttons={formValues.buttons}
      sampleValues={formValues.variableSamples}
    />
  );
}
