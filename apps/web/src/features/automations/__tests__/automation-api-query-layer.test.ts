import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";
import { automationApi } from "../api/automation.api";
import { automationKeys } from "../api/automation.keys";
import type { AutomationDetail } from "../types/automation.types";

describe("automation API and query keys", () => {
  it("builds stable query keys", () => {
    expect(automationKeys.all).toEqual(["automations"]);
    expect(automationKeys.list()).toEqual(["automations", "list"]);
    expect(automationKeys.details()).toEqual(["automations", "detail"]);
    expect(automationKeys.detail("auto_123")).toEqual(["automations", "detail", "auto_123"]);
    expect(automationKeys.fieldOptions("auto_123")).toEqual(["automations", "detail", "auto_123", "field-options"]);
  });

  it("unwraps automation list responses", async () => {
    server.use(
      http.get("http://localhost:4000/api/automations", () =>
        HttpResponse.json({
          data: {
            flows: [
              {
                id: "flow_order",
                key: "ORDER_FLOW",
                name: "Order Flow",
                description: "Order lifecycle.",
                sortOrder: 1,
                automations: []
              }
            ]
          }
        })
      )
    );

    const response = await automationApi.getAutomations();

    expect(response.flows[0]?.name).toBe("Order Flow");
  });

  it("sends update and toggle payloads to the backend", async () => {
    server.use(
      http.put("http://localhost:4000/api/automations/:id", async ({ params, request }) => {
        expect(params.id).toBe("auto_123");
        expect(await request.json()).toEqual({
          templateId: "tmpl_123",
          delayMinutes: 30,
          variableMappings: [
            {
              templateVariableName: "body_1",
              componentType: "BODY",
              variableIndex: 1,
              sourceField: "customer.firstName",
              fallbackValue: "there"
            }
          ]
        });

        return HttpResponse.json({ data: automationDetail({ delayMinutes: 30 }) });
      }),
      http.patch("http://localhost:4000/api/automations/:id/toggle", async ({ params, request }) => {
        expect(params.id).toBe("auto_123");
        expect(await request.json()).toEqual({ isEnabled: true });

        return HttpResponse.json({ data: automationDetail({ isEnabled: true }) });
      })
    );

    const updated = await automationApi.updateAutomation("auto_123", {
      templateId: "tmpl_123",
      delayMinutes: 30,
      variableMappings: [
        {
          templateVariableName: "body_1",
          componentType: "BODY",
          variableIndex: 1,
          sourceField: "customer.firstName",
          fallbackValue: "there"
        }
      ]
    });
    const toggled = await automationApi.toggleAutomation("auto_123", { isEnabled: true });

    expect(updated.delayMinutes).toBe(30);
    expect(toggled.isEnabled).toBe(true);
  });
});

function automationDetail(overrides: Partial<AutomationDetail> = {}): AutomationDetail {
  return {
    id: "auto_123",
    flow: { id: "flow_order", key: "ORDER_FLOW", name: "Order Flow" },
    key: "ORDER_CONFIRMED",
    name: "Order Confirmed",
    description: "Sent when an order is created.",
    triggerSource: "SHOPIFY",
    triggerEvent: "ORDER_CREATED",
    triggerButtonText: null,
    isEnabled: false,
    templateId: "tmpl_123",
    template: null,
    delayMinutes: 0,
    sortOrder: 1,
    isConfigured: false,
    requiredVariables: [],
    variableMappings: [],
    ...overrides
  };
}
