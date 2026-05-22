import {
  AutomationComponentType,
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource
} from "@prisma/client";
import { AutomationVariableResolverService } from "../services/automation-variable-resolver.service.js";

const event = {
  source: AutomationTriggerSource.SHOPIFY,
  eventType: AutomationTriggerEvent.ORDER_CREATED,
  resourceType: AutomationResourceType.ORDER,
  resourceId: "order_123",
  customerPhone: "919999999999",
  data: {
    customer: {
      firstName: "Akshay"
    },
    order: {
      name: "#1001"
    },
    checkout: {
      recoveryUrl: "https://store.example/recover"
    }
  }
};

it("resolves nested event data and top-level fields", () => {
  const result = new AutomationVariableResolverService().resolve(event, [
    {
      templateVariableName: "body_1",
      componentType: AutomationComponentType.BODY,
      variableIndex: 1,
      sourceField: "customer.firstName",
      fallbackValue: null
    },
    {
      templateVariableName: "body_2",
      componentType: AutomationComponentType.BODY,
      variableIndex: 2,
      sourceField: "order.name",
      fallbackValue: null
    },
    {
      templateVariableName: "body_3",
      componentType: AutomationComponentType.BODY,
      variableIndex: 3,
      sourceField: "customerPhone",
      fallbackValue: null
    }
  ]);

  expect(result).toEqual({
    success: true,
    variables: [
      expect.objectContaining({ value: "Akshay" }),
      expect.objectContaining({ value: "#1001" }),
      expect.objectContaining({ value: "919999999999" })
    ]
  });
});

it("uses fallback values when source fields are missing", () => {
  const result = new AutomationVariableResolverService().resolve(event, [
    {
      templateVariableName: "body_1",
      componentType: AutomationComponentType.BODY,
      variableIndex: 1,
      sourceField: "customer.lastName",
      fallbackValue: "there"
    }
  ]);

  expect(result).toEqual({
    success: true,
    variables: [expect.objectContaining({ value: "there" })]
  });
});

it("reports unresolved required variables", () => {
  expect(
    new AutomationVariableResolverService().resolve(event, [
      {
        templateVariableName: "body_1",
        componentType: AutomationComponentType.BODY,
        variableIndex: 1,
        sourceField: "customer.lastName",
        fallbackValue: null
      }
    ])
  ).toEqual({
    success: false,
    reason: "Required variable body_1 could not be resolved."
  });
});
