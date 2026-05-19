import {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderFormat,
  TemplateQualityRating,
  TemplateStatus,
  TemplateType
} from "@prisma/client";
import type { CreateTemplateInput } from "../../domain/template.types.js";
import { extractTemplateVariables } from "../../domain/template-variable.validator.js";
import type { ProviderTemplateSummary } from "../template-provider.adapter.js";
import type {
  MetaCreateTemplatePayload,
  MetaListTemplatesResponse,
  MetaTemplateResponse
} from "./meta-template.types.js";

export function mapCreateTemplateInputToMetaPayload(input: CreateTemplateInput): MetaCreateTemplatePayload {
  const components: MetaCreateTemplatePayload["components"] = [];

  if (input.components.header?.format === TemplateHeaderFormat.TEXT && input.components.header.text?.trim()) {
    const headerVariables = extractTemplateVariables(input.components.header.text, TemplateComponentType.HEADER);
    const headerSamples = headerVariables.map((variable) =>
      findSample(input, variable.componentType, variable.position)
    );

    components.push({
      type: "HEADER",
      format: "TEXT",
      text: input.components.header.text.trim(),
      ...(headerSamples.length > 0 ? { example: { header_text: headerSamples } } : {})
    });
  }

  const bodyVariables = extractTemplateVariables(input.components.body.text, TemplateComponentType.BODY);
  const bodySamples = bodyVariables.map((variable) => findSample(input, variable.componentType, variable.position));

  components.push({
    type: "BODY",
    text: input.components.body.text.trim(),
    ...(bodySamples.length > 0 ? { example: { body_text: [bodySamples] } } : {})
  });

  if (input.components.footer?.text?.trim()) {
    components.push({
      type: "FOOTER",
      text: input.components.footer.text.trim()
    });
  }

  const buttons = input.components.buttons ?? [];
  if (buttons.length > 0) {
    components.push({
      type: "BUTTONS",
      buttons: buttons.map((button) => {
        if (button.type === TemplateButtonType.URL) {
          return { type: "URL", text: button.text.trim(), url: button.url?.trim() ?? "" };
        }
        if (button.type === TemplateButtonType.PHONE_NUMBER) {
          return {
            type: "PHONE_NUMBER",
            text: button.text.trim(),
            phone_number: button.phoneNumber?.trim() ?? ""
          };
        }
        return { type: "QUICK_REPLY", text: button.text.trim() };
      })
    });
  }

  return {
    name: input.name.trim(),
    language: input.languageCode.trim(),
    category: input.category,
    allow_category_change: input.allowCategoryChange ?? false,
    components
  };
}

export function mapMetaCreateResponse(response: MetaTemplateResponse, statusCode: number) {
  return {
    providerTemplateId: response.id ?? null,
    status: mapMetaTemplateStatus(response.status),
    raw: response,
    statusCode
  };
}

export function mapMetaListResponse(response: MetaListTemplatesResponse, statusCode: number) {
  return {
    templates: (response.data ?? []).map(mapMetaTemplateSummary),
    raw: response,
    statusCode
  };
}

export function mapMetaTemplateSummary(template: MetaTemplateResponse): ProviderTemplateSummary {
  return {
    providerTemplateId: template.id ?? null,
    name: template.name ?? "",
    category: mapMetaCategory(template.category),
    type: TemplateType.TEXT,
    languageCode: template.language ?? "en",
    status: mapMetaTemplateStatus(template.status),
    qualityRating: mapMetaQuality(template.quality_score?.score),
    rejectionReason: template.rejected_reason ?? null,
    raw: template
  };
}

function findSample(input: CreateTemplateInput, componentType: TemplateComponentType, position: number) {
  return (
    input.variables.find((variable) => variable.componentType === componentType && variable.position === position)
      ?.sampleValue ?? ""
  );
}

function mapMetaCategory(category: string | undefined) {
  if (category === TemplateCategory.MARKETING || category === TemplateCategory.AUTHENTICATION) return category;
  return TemplateCategory.UTILITY;
}

export function mapMetaTemplateStatus(status: string | undefined, fallback: TemplateStatus = TemplateStatus.PENDING) {
  switch (status) {
    case TemplateStatus.APPROVED:
      return TemplateStatus.APPROVED;
    case TemplateStatus.REJECTED:
      return TemplateStatus.REJECTED;
    case TemplateStatus.PAUSED:
      return TemplateStatus.PAUSED;
    case TemplateStatus.DISABLED:
      return TemplateStatus.DISABLED;
    case "PENDING":
    case undefined:
      return TemplateStatus.PENDING;
    default:
      return fallback;
  }
}

export function isKnownMetaTemplateStatus(status: string | undefined) {
  return (
    status === TemplateStatus.APPROVED ||
    status === TemplateStatus.REJECTED ||
    status === TemplateStatus.PAUSED ||
    status === TemplateStatus.DISABLED ||
    status === "PENDING" ||
    status === undefined
  );
}

function mapMetaQuality(score: string | undefined) {
  if (
    score === TemplateQualityRating.GREEN ||
    score === TemplateQualityRating.YELLOW ||
    score === TemplateQualityRating.RED
  ) {
    return score;
  }
  return TemplateQualityRating.UNKNOWN;
}
