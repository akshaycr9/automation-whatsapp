import type { TemplateTypeFormProps } from "../../config/templateTypeRegistry";
import { getTemplateTypeConfig } from "../../config/templateTypeRegistry";

export function TemplateFormRenderer(props: TemplateTypeFormProps) {
  const config = getTemplateTypeConfig(props.formValues.type);
  const TemplateTypeForm = config.component;

  return <TemplateTypeForm {...props} />;
}
