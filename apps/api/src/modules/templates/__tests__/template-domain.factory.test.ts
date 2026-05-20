import {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderFormat,
  TemplateStatus,
  TemplateType
} from "@prisma/client";
import { TextTemplateFactory } from "../domain/text-template.factory.js";

it("builds normalized text template persistence data", () => {
  const data = new TextTemplateFactory().build(
    {
      name: "order_confirmation_v1",
      displayName: "Order Confirmation",
      category: TemplateCategory.UTILITY,
      type: TemplateType.TEXT,
      languageCode: "en",
      components: {
        header: { format: TemplateHeaderFormat.TEXT, text: "Order confirmed" },
        body: { text: "Hi {{1}}" },
        footer: { text: "Qwertees" },
        buttons: [{ type: TemplateButtonType.QUICK_REPLY, text: "Thanks" }]
      },
      variables: [
        { componentType: TemplateComponentType.BODY, position: 1, placeholder: "{{1}}", sampleValue: "Akshay" }
      ]
    },
    { adminUserId: "admin_123" }
  );

  expect(data.template).toMatchObject({
    name: "order_confirmation_v1",
    status: TemplateStatus.DRAFT,
    createdById: "admin_123"
  });
  expect(data.components.map((component) => component.componentType)).toEqual([
    TemplateComponentType.HEADER,
    TemplateComponentType.BODY,
    TemplateComponentType.FOOTER
  ]);
  expect(data.variables).toEqual([
    expect.objectContaining({ componentType: TemplateComponentType.BODY, position: 1, sampleValue: "Akshay" })
  ]);
  expect(data.buttons).toEqual([expect.objectContaining({ buttonType: TemplateButtonType.QUICK_REPLY, sortOrder: 0 })]);
  expect(data.event).toEqual(expect.objectContaining({ newStatus: TemplateStatus.DRAFT }));
});
