import { AutomationComponentType } from "@prisma/client";
import type {
  WhatsAppTemplateSendComponent,
  WhatsAppTemplateSendInput
} from "../../whatsapp/services/meta-whatsapp-template-sender.service.js";
import type { ResolvedAutomationVariable } from "./automation-variable-resolver.service.js";

export type AutomationTemplatePayloadInput = {
  to: string;
  template: {
    name: string;
    languageCode: string;
  };
  variables: ResolvedAutomationVariable[];
};

export class AutomationTemplatePayloadBuilderService {
  build(input: AutomationTemplatePayloadInput): WhatsAppTemplateSendInput {
    return {
      to: input.to,
      templateName: input.template.name,
      languageCode: input.template.languageCode,
      components: this.buildComponents(input.variables)
    };
  }

  private buildComponents(variables: ResolvedAutomationVariable[]) {
    const components: WhatsAppTemplateSendComponent[] = [];
    const headerVariables = variables
      .filter((variable) => variable.componentType === AutomationComponentType.HEADER)
      .sort(sortByIndex);
    const bodyVariables = variables
      .filter((variable) => variable.componentType === AutomationComponentType.BODY)
      .sort(sortByIndex);
    const buttonVariables = variables
      .filter((variable) => variable.componentType === AutomationComponentType.BUTTON)
      .sort(sortByIndex);

    if (headerVariables.length > 0) {
      components.push({
        type: "header",
        parameters: headerVariables.map((variable) => ({ type: "text", text: variable.value }))
      });
    }

    if (bodyVariables.length > 0) {
      components.push({
        type: "body",
        parameters: bodyVariables.map((variable) => ({ type: "text", text: variable.value }))
      });
    }

    for (const variable of buttonVariables) {
      components.push({
        type: "button",
        sub_type: "quick_reply",
        index: String(Math.max(0, variable.variableIndex - 1)),
        parameters: [{ type: "payload", payload: variable.value }]
      });
    }

    return components;
  }
}

function sortByIndex(left: ResolvedAutomationVariable, right: ResolvedAutomationVariable) {
  return left.variableIndex - right.variableIndex;
}
