import type { TemplateTypeFormProps } from "../../config/templateTypeRegistry";
import { ButtonEditor } from "./ButtonEditor";
import { TemplateMessageSection } from "./TemplateMessageSection";
import { VariableMappingPanel } from "./VariableMappingPanel";

export function TextTemplateForm({
  formValues,
  detectedVariables,
  visibleErrors,
  onHeaderFormatChange,
  onHeaderTextChange,
  onBodyTextChange,
  onFooterTextChange,
  onButtonsChange,
  onSampleValueChange
}: TemplateTypeFormProps) {
  return (
    <>
      <TemplateMessageSection
        headerFormat={formValues.headerFormat}
        headerText={formValues.headerText ?? ""}
        bodyText={formValues.bodyText}
        footerText={formValues.footerText ?? ""}
        onHeaderFormatChange={onHeaderFormatChange}
        onHeaderTextChange={onHeaderTextChange}
        onBodyTextChange={onBodyTextChange}
        onFooterTextChange={onFooterTextChange}
        errors={visibleErrors}
      />
      <ButtonEditor buttons={formValues.buttons} onButtonsChange={onButtonsChange} errors={visibleErrors} />
      <VariableMappingPanel
        variables={detectedVariables}
        sampleValues={formValues.variableSamples}
        onSampleValueChange={onSampleValueChange}
        errors={visibleErrors}
      />
    </>
  );
}
