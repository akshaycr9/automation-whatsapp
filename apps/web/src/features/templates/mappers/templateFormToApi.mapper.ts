import type { CreateTemplateFormValues, CreateTemplatePayload, TemplateVariable } from "../types/template.types";
import { mapTextTemplateFormToApiPayload } from "./textTemplateFormToApi.mapper";

export function mapTemplateFormToApiPayload(
  values: CreateTemplateFormValues,
  detectedVariables: TemplateVariable[]
): CreateTemplatePayload {
  if (values.type === "TEXT") {
    return mapTextTemplateFormToApiPayload(values, detectedVariables);
  }
  throw new Error(`${values.type} templates cannot be mapped in this phase.`);
}
