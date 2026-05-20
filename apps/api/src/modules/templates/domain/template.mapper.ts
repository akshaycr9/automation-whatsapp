import { TemplateComponentType, TemplateHeaderFormat, TemplateButtonType } from "@prisma/client";
import type { TemplateButtonInput, TemplateDetailResponse, TemplateListItemResponse } from "./template.types.js";

type TemplateWithRelations = {
  id: string;
  metaTemplateId: string | null;
  name: string;
  displayName: string | null;
  category: TemplateListItemResponse["category"];
  type: TemplateListItemResponse["type"];
  languageCode: string;
  status: TemplateListItemResponse["status"];
  qualityRating: TemplateListItemResponse["qualityRating"];
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt: Date | null;
  components?: Array<{
    componentType: TemplateComponentType;
    format: TemplateHeaderFormat | null;
    text: string | null;
    sortOrder: number;
  }>;
  variables?: Array<{
    componentType: TemplateComponentType;
    position: number;
    placeholder: string;
    sampleValue: string;
    sourceKey: string | null;
  }>;
  buttons?: Array<{
    buttonType: TemplateButtonType;
    text: string;
    url: string | null;
    phoneNumber: string | null;
    payload: string | null;
    flowId: string | null;
    sortOrder: number;
  }>;
};

export function mapTemplateToListItem(template: TemplateWithRelations): TemplateListItemResponse {
  return {
    id: template.id,
    metaTemplateId: template.metaTemplateId,
    name: template.name,
    displayName: template.displayName ?? template.name,
    category: template.category,
    type: template.type,
    languageCode: template.languageCode,
    status: template.status,
    qualityRating: template.qualityRating,
    rejectionReason: template.rejectionReason,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    lastSyncedAt: template.lastSyncedAt?.toISOString() ?? null
  };
}

export function mapTemplateToDetailResponse(template: TemplateWithRelations): TemplateDetailResponse {
  const components = [...(template.components ?? [])].sort((left, right) => left.sortOrder - right.sortOrder);
  const header = components.find((component) => component.componentType === TemplateComponentType.HEADER);
  const body = components.find((component) => component.componentType === TemplateComponentType.BODY);
  const footer = components.find((component) => component.componentType === TemplateComponentType.FOOTER);

  return {
    ...mapTemplateToListItem(template),
    components: {
      ...(header?.text
        ? {
            header: {
              format: header.format ?? TemplateHeaderFormat.TEXT,
              text: header.text
            }
          }
        : {}),
      body: {
        text: body?.text ?? ""
      },
      ...(footer?.text ? { footer: { text: footer.text } } : {}),
      buttons: [...(template.buttons ?? [])]
        .sort((left, right) => left.sortOrder - right.sortOrder)
        .map(
          (button): TemplateButtonInput => ({
            type: button.buttonType,
            text: button.text,
            ...(button.url ? { url: button.url } : {}),
            ...(button.phoneNumber ? { phoneNumber: button.phoneNumber } : {}),
            ...(button.payload ? { payload: button.payload } : {}),
            ...(button.flowId ? { flowId: button.flowId } : {})
          })
        )
    },
    variables: [...(template.variables ?? [])]
      .sort((left, right) => left.position - right.position)
      .map((variable) => ({
        componentType: variable.componentType,
        position: variable.position,
        placeholder: variable.placeholder,
        sampleValue: variable.sampleValue,
        sourceKey: variable.sourceKey
      }))
  };
}
