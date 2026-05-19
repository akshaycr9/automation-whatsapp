import { SectionErrorBoundary } from "@/components/error-boundaries";
import { Button } from "@/components/ui/button";
import { ButtonEditor } from "../components/TemplateBuilder/ButtonEditor";
import { TemplateBasicInfoSection } from "../components/TemplateBuilder/TemplateBasicInfoSection";
import { TemplateBuilderShell } from "../components/TemplateBuilder/TemplateBuilderShell";
import { TemplateMessageSection } from "../components/TemplateBuilder/TemplateMessageSection";
import { ValidationChecklist } from "../components/TemplateBuilder/ValidationChecklist";
import { VariableMappingPanel } from "../components/TemplateBuilder/VariableMappingPanel";
import { TemplatePreview } from "../components/TemplatePreview/TemplatePreview";
import { useCreateTemplatePageState } from "../hooks/useCreateTemplatePageState";

export function CreateTemplatePage() {
  const pageState = useCreateTemplatePageState();
  const {
    canSubmit,
    checklist,
    createTemplate,
    detectedVariables,
    feedback,
    formValues,
    updateSampleValue,
    visibleErrors
  } = pageState;

  return (
    <section aria-labelledby="create-template-title" className="space-y-5">
      <div>
        <h1 id="create-template-title" className="text-2xl font-semibold tracking-tight text-text">
          Create Template
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Build a text WhatsApp template. Meta submission remains mocked in this phase.
        </p>
      </div>

      {feedback ? (
        <div className="rounded-md border border-info/30 bg-info-soft px-4 py-3 text-sm text-text" role="status">
          {feedback}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <SectionErrorBoundary name="Template Builder">
          <TemplateBuilderShell>
            <TemplateBasicInfoSection
              name={formValues.name}
              displayName={formValues.displayName}
              category={formValues.category}
              languageCode={formValues.languageCode}
              type={formValues.type}
              onNameChange={pageState.updateName}
              onDisplayNameChange={pageState.updateDisplayName}
              onCategoryChange={pageState.updateCategory}
              onLanguageCodeChange={pageState.updateLanguageCode}
              errors={visibleErrors}
            />
            <TemplateMessageSection
              headerFormat={formValues.headerFormat}
              headerText={formValues.headerText ?? ""}
              bodyText={formValues.bodyText}
              footerText={formValues.footerText ?? ""}
              onHeaderFormatChange={pageState.updateHeaderFormat}
              onHeaderTextChange={pageState.updateHeaderText}
              onBodyTextChange={pageState.updateBodyText}
              onFooterTextChange={pageState.updateFooterText}
              errors={visibleErrors}
            />
            <ButtonEditor
              buttons={formValues.buttons}
              onButtonsChange={pageState.updateButtons}
              errors={visibleErrors}
            />
            <VariableMappingPanel
              variables={detectedVariables}
              sampleValues={formValues.variableSamples}
              onSampleValueChange={updateSampleValue}
              errors={visibleErrors}
            />
            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-end">
              <Button className="w-full sm:w-auto" type="button" variant="ghost" onClick={pageState.cancel}>
                Cancel
              </Button>
              <Button className="w-full sm:w-auto" type="button" variant="secondary" onClick={pageState.saveDraft}>
                Save as draft
              </Button>
              <Button
                className="w-full sm:w-auto"
                type="button"
                disabled={!canSubmit || createTemplate.isPending}
                onClick={() => void pageState.submitTemplate()}
              >
                {createTemplate.isPending ? "Submitting..." : "Submit for approval"}
              </Button>
            </div>
          </TemplateBuilderShell>
        </SectionErrorBoundary>

        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <SectionErrorBoundary name="Template Preview">
            <TemplatePreview
              headerFormat={formValues.headerFormat}
              headerText={formValues.headerText ?? ""}
              bodyText={formValues.bodyText}
              footerText={formValues.footerText ?? ""}
              buttons={formValues.buttons}
              sampleValues={formValues.variableSamples}
            />
          </SectionErrorBoundary>
          <SectionErrorBoundary name="Template Validation">
            <ValidationChecklist items={checklist} />
          </SectionErrorBoundary>
        </div>
      </div>
    </section>
  );
}
