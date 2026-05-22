import { AutomationComponentType } from "@prisma/client";
import { AutomationTemplatePayloadBuilderService } from "../services/automation-template-payload-builder.service.js";

it("builds WhatsApp template payloads with header, body, and button variables in sender format", () => {
  const result = new AutomationTemplatePayloadBuilderService().build({
    to: "919999999999",
    template: {
      name: "cod_confirmation",
      languageCode: "en"
    },
    variables: [
      {
        templateVariableName: "body_2",
        componentType: AutomationComponentType.BODY,
        variableIndex: 2,
        value: "#1001"
      },
      {
        templateVariableName: "header_1",
        componentType: AutomationComponentType.HEADER,
        variableIndex: 1,
        value: "Akshay"
      },
      {
        templateVariableName: "button_1",
        componentType: AutomationComponentType.BUTTON,
        variableIndex: 1,
        value: "COD_CONFIRM:ORDER:123456789"
      },
      {
        templateVariableName: "body_1",
        componentType: AutomationComponentType.BODY,
        variableIndex: 1,
        value: "Akshay"
      }
    ]
  });

  expect(result).toEqual({
    to: "919999999999",
    templateName: "cod_confirmation",
    languageCode: "en",
    components: [
      {
        type: "header",
        parameters: [{ type: "text", text: "Akshay" }]
      },
      {
        type: "body",
        parameters: [
          { type: "text", text: "Akshay" },
          { type: "text", text: "#1001" }
        ]
      },
      {
        type: "button",
        sub_type: "quick_reply",
        index: "0",
        parameters: [{ type: "payload", payload: "COD_CONFIRM:ORDER:123456789" }]
      }
    ]
  });
});
