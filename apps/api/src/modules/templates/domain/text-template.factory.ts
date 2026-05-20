import {
  TemplateComponentType,
  TemplateEventType,
  TemplateHeaderFormat,
  TemplateStatus,
  TemplateType
} from "@prisma/client";
import type { CreateTemplateInput, PreparedTemplateCreateData, TemplateScope } from "./template.types.js";

export class TextTemplateFactory {
  build(input: CreateTemplateInput, context: TemplateScope): PreparedTemplateCreateData {
    const components: PreparedTemplateCreateData["components"] = [
      {
        componentType: TemplateComponentType.BODY,
        text: input.components.body.text.trim(),
        sortOrder: 0
      }
    ];

    if (input.components.header?.format === TemplateHeaderFormat.TEXT && input.components.header.text?.trim()) {
      components.unshift({
        componentType: TemplateComponentType.HEADER,
        format: TemplateHeaderFormat.TEXT,
        text: input.components.header.text.trim(),
        sortOrder: 0
      });
    }

    if (input.components.footer?.text?.trim()) {
      components.push({
        componentType: TemplateComponentType.FOOTER,
        text: input.components.footer.text.trim(),
        sortOrder: 0
      });
    }

    return {
      template: {
        name: input.name.trim(),
        displayName: input.displayName?.trim() || null,
        category: input.category,
        type: TemplateType.TEXT,
        languageCode: input.languageCode.trim(),
        status: TemplateStatus.DRAFT,
        allowCategoryChange: input.allowCategoryChange ?? false,
        createdById: context.adminUserId,
        updatedById: context.adminUserId
      },
      components,
      variables: input.variables.map((variable) => ({
        componentType: variable.componentType,
        position: variable.position,
        placeholder: variable.placeholder,
        sampleValue: variable.sampleValue.trim(),
        sourceKey: variable.sourceKey ?? null,
        label: variable.label ?? null,
        fallbackValue: variable.fallbackValue ?? null
      })),
      buttons: (input.components.buttons ?? []).map((button, index) => ({
        buttonType: button.type,
        text: button.text.trim(),
        url: button.url?.trim() || null,
        phoneNumber: button.phoneNumber?.trim() || null,
        payload: button.payload?.trim() || null,
        flowId: button.flowId?.trim() || null,
        sortOrder: index
      })),
      event: {
        eventType: TemplateEventType.CREATED,
        newStatus: TemplateStatus.DRAFT,
        message: "Template created locally as draft.",
        createdById: context.adminUserId
      }
    };
  }
}
