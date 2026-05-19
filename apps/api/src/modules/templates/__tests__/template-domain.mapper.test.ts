import {
  TemplateButtonType,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderFormat,
  TemplateQualityRating,
  TemplateStatus,
  TemplateType
} from "@prisma/client";
import { mapTemplateToDetailResponse } from "../domain/template.mapper.js";

it("maps Prisma-like template relations to API detail components", () => {
  const now = new Date("2026-05-19T10:00:00.000Z");
  const response = mapTemplateToDetailResponse({
    id: "tmpl_123",
    metaTemplateId: "meta_123",
    name: "order_confirmation_v1",
    displayName: "Order Confirmation",
    category: TemplateCategory.UTILITY,
    type: TemplateType.TEXT,
    languageCode: "en",
    status: TemplateStatus.APPROVED,
    qualityRating: TemplateQualityRating.GREEN,
    rejectionReason: null,
    createdAt: now,
    updatedAt: now,
    lastSyncedAt: null,
    components: [
      { componentType: TemplateComponentType.BODY, format: null, text: "Hi {{1}}", sortOrder: 1 },
      {
        componentType: TemplateComponentType.HEADER,
        format: TemplateHeaderFormat.TEXT,
        text: "Order confirmed",
        sortOrder: 0
      }
    ],
    variables: [
      {
        componentType: TemplateComponentType.BODY,
        position: 1,
        placeholder: "{{1}}",
        sampleValue: "Akshay",
        sourceKey: null
      }
    ],
    buttons: [
      {
        buttonType: TemplateButtonType.URL,
        text: "Track",
        url: "https://example.com/track",
        phoneNumber: null,
        payload: null,
        flowId: null,
        sortOrder: 0
      }
    ]
  });

  expect(response.components).toEqual({
    header: { format: TemplateHeaderFormat.TEXT, text: "Order confirmed" },
    body: { text: "Hi {{1}}" },
    buttons: [{ type: TemplateButtonType.URL, text: "Track", url: "https://example.com/track" }]
  });
  expect(response.variables).toEqual([
    {
      componentType: TemplateComponentType.BODY,
      position: 1,
      placeholder: "{{1}}",
      sampleValue: "Akshay",
      sourceKey: null
    }
  ]);
});
