import {
  AutomationComponentType,
  AutomationFlowKey,
  AutomationKey,
  AutomationTriggerEvent,
  AutomationTriggerSource,
  TemplateCategory,
  TemplateComponentType,
  TemplateHeaderFormat,
  TemplateStatus
} from "@prisma/client";
import { AutomationsService } from "../automations.service.js";
import { AutomationNotConfiguredError, AutomationValidationDomainError } from "../domain/automation.errors.js";
import type {
  AutomationFlowRecord,
  AutomationRecord,
  AutomationTemplateRecord,
  UpdateAutomationInput
} from "../domain/automation.types.js";

const scope = { adminUserId: "admin_123" };

function createTemplate(overrides: Partial<AutomationTemplateRecord> = {}): AutomationTemplateRecord {
  return {
    id: "tmpl_123",
    name: "order_confirmed",
    displayName: "Order Confirmed",
    category: TemplateCategory.UTILITY,
    languageCode: "en",
    status: TemplateStatus.APPROVED,
    components: [
      {
        componentType: TemplateComponentType.BODY,
        format: TemplateHeaderFormat.NONE,
        text: "Hi {{1}}",
        sortOrder: 1
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
    ...overrides
  };
}

function createAutomation(overrides: Partial<AutomationRecord> = {}): AutomationRecord {
  const template = overrides.template === undefined ? createTemplate() : overrides.template;

  return {
    id: "auto_123",
    key: AutomationKey.ORDER_CONFIRMED,
    name: "Order Confirmed",
    description: "Sent when an order is created.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.ORDER_CREATED,
    isEnabled: false,
    templateId: template?.id ?? null,
    delayMinutes: 0,
    sortOrder: 1,
    flow: {
      id: "flow_order",
      key: AutomationFlowKey.ORDER_FLOW,
      name: "Order Flow"
    },
    template,
    variableMappings: template
      ? [
          {
            id: "mapping_123",
            templateVariableName: "body_1",
            componentType: AutomationComponentType.BODY,
            variableIndex: 1,
            sourceField: "customer.firstName",
            fallbackValue: "there"
          }
        ]
      : [],
    ...overrides
  };
}

function createRepository(overrides: Record<string, unknown> = {}) {
  return {
    findFlowsWithAutomations: vi.fn(),
    findAutomationById: vi.fn(),
    findTemplateById: vi.fn(),
    updateAutomationConfig: vi.fn(),
    updateAutomationEnabled: vi.fn(),
    transaction: vi.fn((callback) => callback({ tx: true })),
    ...overrides
  };
}

it("returns flows grouped with derived configuration counts", async () => {
  const automation = createAutomation();
  const flows: AutomationFlowRecord[] = [
    {
      id: "flow_order",
      key: AutomationFlowKey.ORDER_FLOW,
      name: "Order Flow",
      description: "Order lifecycle automations.",
      sortOrder: 1,
      automations: [automation]
    }
  ];
  const repository = createRepository({
    findFlowsWithAutomations: vi.fn().mockResolvedValue(flows)
  });
  const service = new AutomationsService(repository as never);

  const result = await service.getAutomationsList();

  expect(result.data.flows).toHaveLength(1);
  expect(result.data.flows[0]).toEqual(
    expect.objectContaining({
      key: AutomationFlowKey.ORDER_FLOW,
      automations: [
        expect.objectContaining({
          id: "auto_123",
          templateName: "Order Confirmed",
          isConfigured: true,
          mappedVariablesCount: 1,
          requiredVariablesCount: 1
        })
      ]
    })
  );
});

it("returns automation detail with template variables derived for the edit screen", async () => {
  const repository = createRepository({
    findAutomationById: vi.fn().mockResolvedValue(createAutomation())
  });
  const service = new AutomationsService(repository as never);

  const result = await service.getAutomationDetail("auto_123");

  expect(result.data).toEqual(
    expect.objectContaining({
      id: "auto_123",
      isConfigured: true,
      requiredVariables: [
        expect.objectContaining({
          templateVariableName: "body_1",
          componentType: AutomationComponentType.BODY,
          variableIndex: 1
        })
      ],
      variableMappings: [expect.objectContaining({ sourceField: "customer.firstName" })]
    })
  );
  expect(result.data.template).toEqual(
    expect.objectContaining({
      id: "tmpl_123",
      language: "en",
      status: TemplateStatus.APPROVED
    })
  );
});

it("updates automation config and replaces mappings inside a transaction", async () => {
  const automation = createAutomation({ template: null, templateId: null, variableMappings: [] });
  const template = createTemplate();
  const input: UpdateAutomationInput = {
    templateId: "tmpl_123",
    delayMinutes: 15,
    variableMappings: [
      {
        templateVariableName: "body_1",
        componentType: AutomationComponentType.BODY,
        variableIndex: 1,
        sourceField: "customer.firstName",
        fallbackValue: "there"
      }
    ]
  };
  const updated = createAutomation({ delayMinutes: 15 });
  const transactionClient = { tx: true };
  const repository = createRepository({
    transaction: vi.fn((callback) => callback(transactionClient)),
    findAutomationById: vi.fn().mockResolvedValue(automation),
    findTemplateById: vi.fn().mockResolvedValue(template),
    updateAutomationConfig: vi.fn().mockResolvedValue(updated)
  });
  const service = new AutomationsService(repository as never);

  const result = await service.updateAutomation("auto_123", input, scope);

  expect(repository.transaction).toHaveBeenCalledOnce();
  expect(repository.findTemplateById).toHaveBeenCalledWith("tmpl_123", "admin_123", transactionClient);
  expect(repository.updateAutomationConfig).toHaveBeenCalledWith("auto_123", input, transactionClient);
  expect(result.data.delayMinutes).toBe(15);
  expect(result.data.isConfigured).toBe(true);
});

it("rejects mappings with source fields outside the automation flow options", async () => {
  const automation = createAutomation();
  const repository = createRepository({
    findAutomationById: vi.fn().mockResolvedValue(automation),
    findTemplateById: vi.fn().mockResolvedValue(automation.template)
  });
  const service = new AutomationsService(repository as never);

  await expect(
    service.updateAutomation(
      "auto_123",
      {
        templateId: "tmpl_123",
        delayMinutes: 0,
        variableMappings: [
          {
            templateVariableName: "body_1",
            componentType: AutomationComponentType.BODY,
            variableIndex: 1,
            sourceField: "checkout.recoveryUrl"
          }
        ]
      },
      scope
    )
  ).rejects.toMatchObject({
    details: [expect.objectContaining({ field: "variableMappings.0.sourceField" })]
  });
});

it("rejects duplicate mappings for the same component and variable index", async () => {
  const automation = createAutomation();
  const repository = createRepository({
    findAutomationById: vi.fn().mockResolvedValue(automation),
    findTemplateById: vi.fn().mockResolvedValue(automation.template)
  });
  const service = new AutomationsService(repository as never);

  await expect(
    service.updateAutomation(
      "auto_123",
      {
        templateId: "tmpl_123",
        delayMinutes: 0,
        variableMappings: [
          {
            templateVariableName: "body_1",
            componentType: AutomationComponentType.BODY,
            variableIndex: 1,
            sourceField: "customer.firstName"
          },
          {
            templateVariableName: "body_1",
            componentType: AutomationComponentType.BODY,
            variableIndex: 1,
            sourceField: "customer.lastName"
          }
        ]
      },
      scope
    )
  ).rejects.toBeInstanceOf(AutomationValidationDomainError);
});

it("rejects updates that would leave an enabled automation unconfigured", async () => {
  const automation = createAutomation({ isEnabled: true });
  const repository = createRepository({
    findAutomationById: vi.fn().mockResolvedValue(automation),
    findTemplateById: vi.fn().mockResolvedValue(automation.template)
  });
  const service = new AutomationsService(repository as never);

  await expect(
    service.updateAutomation(
      "auto_123",
      {
        templateId: "tmpl_123",
        delayMinutes: 0,
        variableMappings: []
      },
      scope
    )
  ).rejects.toMatchObject({
    details: [expect.objectContaining({ field: "request" })]
  });
});

it("enables only configured automations using approved templates", async () => {
  const automation = createAutomation();
  const repository = createRepository({
    findAutomationById: vi.fn().mockResolvedValue(automation),
    updateAutomationEnabled: vi.fn().mockResolvedValue({ ...automation, isEnabled: true })
  });
  const service = new AutomationsService(repository as never);

  const result = await service.toggleAutomation("auto_123", { isEnabled: true });

  expect(repository.updateAutomationEnabled).toHaveBeenCalledWith("auto_123", true);
  expect(result.data.isEnabled).toBe(true);
});

it("rejects enabling an automation without a complete approved template configuration", async () => {
  const automation = createAutomation({
    template: createTemplate({ status: TemplateStatus.PENDING }),
    variableMappings: []
  });
  const repository = createRepository({
    findAutomationById: vi.fn().mockResolvedValue(automation)
  });
  const service = new AutomationsService(repository as never);

  await expect(service.toggleAutomation("auto_123", { isEnabled: true })).rejects.toBeInstanceOf(
    AutomationNotConfiguredError
  );
  expect(repository.updateAutomationEnabled).not.toHaveBeenCalled();
});

it("allows disabling an incomplete automation", async () => {
  const automation = createAutomation({ template: null, templateId: null, isEnabled: true, variableMappings: [] });
  const repository = createRepository({
    findAutomationById: vi.fn().mockResolvedValue(automation),
    updateAutomationEnabled: vi.fn().mockResolvedValue({ ...automation, isEnabled: false })
  });
  const service = new AutomationsService(repository as never);

  const result = await service.toggleAutomation("auto_123", { isEnabled: false });

  expect(repository.updateAutomationEnabled).toHaveBeenCalledWith("auto_123", false);
  expect(result.data.isEnabled).toBe(false);
});

it("returns field options based on the automation flow", async () => {
  const repository = createRepository({
    findAutomationById: vi
      .fn()
      .mockResolvedValue(
        createAutomation({ flow: { id: "flow_cod", key: AutomationFlowKey.COD_FLOW, name: "COD Flow" } })
      )
  });
  const service = new AutomationsService(repository as never);

  const result = await service.getFieldOptions("auto_123");

  expect(result.data.groups).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        label: "COD",
        options: expect.arrayContaining([expect.objectContaining({ value: "order.confirmUrl" })])
      })
    ])
  );
});
