import {
  AutomationFlowKey,
  AutomationKey,
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource
} from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import { AutomationStrategyProvider } from "../providers/automation-strategy.provider.js";
import { AutomationEngineService } from "../services/automation-engine.service.js";

const incomingEvent = {
  id: "incoming_123",
  source: AutomationTriggerSource.SHOPIFY,
  eventType: AutomationTriggerEvent.ORDER_CREATED,
  externalEventId: "external_123",
  resourceType: AutomationResourceType.ORDER,
  resourceId: "order_123",
  customerPhone: "919999999999",
  payloadJson: {},
  receivedAt: new Date(),
  processedAt: null,
  isProcessed: false,
  errorMessage: null,
  createdAt: new Date(),
  updatedAt: new Date()
};

function createAutomation(overrides: Record<string, unknown> = {}) {
  return {
    id: "automation_123",
    flowId: "flow_123",
    key: AutomationKey.ORDER_CONFIRMED,
    name: "Order Confirmed",
    description: "Order confirmed",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.ORDER_CREATED,
    isEnabled: true,
    templateId: "template_123",
    delayMinutes: 0,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    flow: {
      id: "flow_123",
      key: AutomationFlowKey.ORDER_FLOW,
      name: "Order Flow",
      description: "Order flow",
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    template: {
      id: "template_123"
    },
    ...overrides
  };
}

function createEngine(
  overrides: {
    repository?: Record<string, unknown>;
    jobService?: Record<string, unknown>;
    actionStateService?: Record<string, unknown>;
  } = {}
) {
  const repository = {
    findEnabledByTrigger: vi.fn(),
    findButtonTargetAutomation: vi.fn(),
    ...overrides.repository
  };
  const jobService = {
    createAutomationJobAndEnqueue: vi.fn(),
    ...overrides.jobService
  };
  const actionStateService = {
    createPendingCodState: vi.fn(),
    transitionCodState: vi.fn().mockResolvedValue(true),
    ...overrides.actionStateService
  };

  return {
    repository,
    jobService,
    actionStateService,
    engine: new AutomationEngineService(
      repository as never,
      new AutomationStrategyProvider(),
      jobService as never,
      actionStateService as never
    )
  };
}

it("creates a queued send job for enabled Shopify ORDER_CREATED automations", async () => {
  const automation = createAutomation();
  const { engine, repository, jobService } = createEngine({
    repository: {
      findEnabledByTrigger: vi.fn().mockResolvedValue([automation])
    }
  });
  const event: InternalAutomationEvent = {
    source: AutomationTriggerSource.SHOPIFY,
    eventType: AutomationTriggerEvent.ORDER_CREATED,
    resourceType: AutomationResourceType.ORDER,
    resourceId: "order_123",
    customerPhone: "919999999999",
    data: {}
  };

  await engine.handleEvent(event, incomingEvent);

  expect(repository.findEnabledByTrigger).toHaveBeenCalledWith(
    AutomationTriggerSource.SHOPIFY,
    AutomationTriggerEvent.ORDER_CREATED
  );
  expect(jobService.createAutomationJobAndEnqueue).toHaveBeenCalledWith(
    expect.objectContaining({
      automation,
      incomingEvent,
      event,
      idempotencyKey: "SHOPIFY:ORDER_CONFIRMED:ORDER:order_123"
    })
  );
});

it("creates COD confirmation and follow-up jobs and records pending COD state", async () => {
  const confirmation = createAutomation({
    id: "automation_confirm",
    key: AutomationKey.COD_ORDER_CONFIRMATION,
    triggerEvent: AutomationTriggerEvent.COD_ORDER_CREATED
  });
  const followup = createAutomation({
    id: "automation_followup",
    key: AutomationKey.COD_ORDER_FOLLOW_UP,
    triggerEvent: AutomationTriggerEvent.COD_ORDER_CREATED,
    delayMinutes: 240
  });
  const { engine, jobService, actionStateService } = createEngine({
    repository: {
      findEnabledByTrigger: vi.fn().mockResolvedValue([confirmation, followup])
    }
  });
  const event: InternalAutomationEvent = {
    source: AutomationTriggerSource.SHOPIFY,
    eventType: AutomationTriggerEvent.COD_ORDER_CREATED,
    resourceType: AutomationResourceType.ORDER,
    resourceId: "order_123",
    customerPhone: "919999999999",
    data: {}
  };

  await engine.handleEvent(event, { ...incomingEvent, eventType: AutomationTriggerEvent.COD_ORDER_CREATED });

  expect(actionStateService.createPendingCodState).toHaveBeenCalledOnce();
  expect(jobService.createAutomationJobAndEnqueue).toHaveBeenCalledTimes(2);
  expect(jobService.createAutomationJobAndEnqueue).toHaveBeenCalledWith(
    expect.objectContaining({ idempotencyKey: "SHOPIFY:COD_ORDER_CONFIRMATION:ORDER:order_123" })
  );
  expect(jobService.createAutomationJobAndEnqueue).toHaveBeenCalledWith(
    expect.objectContaining({ idempotencyKey: "SHOPIFY:COD_ORDER_FOLLOW_UP:ORDER:order_123" })
  );
});

it("resolves WhatsApp COD confirm button actions to the target automation", async () => {
  const targetAutomation = createAutomation({
    id: "automation_cod_confirmed",
    key: AutomationKey.COD_ORDER_CONFIRMED,
    triggerSource: AutomationTriggerSource.WHATSAPP,
    triggerEvent: AutomationTriggerEvent.BUTTON_REPLY
  });
  const { engine, repository, jobService, actionStateService } = createEngine({
    repository: {
      findButtonTargetAutomation: vi.fn().mockResolvedValue({
        payloadPrefix: "COD_CONFIRM:ORDER",
        targetAutomation
      })
    }
  });
  const event: InternalAutomationEvent = {
    source: AutomationTriggerSource.WHATSAPP,
    eventType: AutomationTriggerEvent.BUTTON_REPLY,
    resourceType: AutomationResourceType.ORDER,
    resourceId: "order_123",
    customerPhone: "919999999999",
    action: {
      type: "BUTTON_REPLY",
      actionKey: "COD_CONFIRM",
      payload: "COD_CONFIRM:ORDER:order_123",
      text: "Confirm my order"
    },
    data: {}
  };

  await engine.handleEvent(event, { ...incomingEvent, source: AutomationTriggerSource.WHATSAPP });

  expect(repository.findButtonTargetAutomation).toHaveBeenCalledWith({
    actionKey: "COD_CONFIRM",
    resourceType: AutomationResourceType.ORDER,
    payload: "COD_CONFIRM:ORDER:order_123"
  });
  expect(actionStateService.transitionCodState).toHaveBeenCalledOnce();
  expect(jobService.createAutomationJobAndEnqueue).toHaveBeenCalledWith(
    expect.objectContaining({
      automation: targetAutomation,
      idempotencyKey: "WHATSAPP:COD_ORDER_CONFIRMED:ORDER:order_123"
    })
  );
});

it("skips disabled and unconfigured automations", async () => {
  const disabled = createAutomation({ isEnabled: false });
  const withoutTemplate = createAutomation({ id: "automation_no_template", templateId: null, template: null });
  const { engine, jobService } = createEngine({
    repository: {
      findEnabledByTrigger: vi.fn().mockResolvedValue([disabled, withoutTemplate])
    }
  });
  const event: InternalAutomationEvent = {
    source: AutomationTriggerSource.SHOPIFY,
    eventType: AutomationTriggerEvent.ORDER_CREATED,
    resourceType: AutomationResourceType.ORDER,
    resourceId: "order_123",
    customerPhone: "919999999999",
    data: {}
  };

  await engine.handleEvent(event, incomingEvent);

  expect(jobService.createAutomationJobAndEnqueue).not.toHaveBeenCalled();
});

it("skips conflicting final COD state transitions", async () => {
  const targetAutomation = createAutomation({
    key: AutomationKey.COD_ORDER_CANCELLED,
    triggerSource: AutomationTriggerSource.WHATSAPP,
    triggerEvent: AutomationTriggerEvent.BUTTON_REPLY
  });
  const { engine, jobService } = createEngine({
    repository: {
      findButtonTargetAutomation: vi.fn().mockResolvedValue({
        payloadPrefix: "COD_CANCEL:ORDER",
        targetAutomation
      })
    },
    actionStateService: {
      transitionCodState: vi.fn().mockResolvedValue(false)
    }
  });
  const event: InternalAutomationEvent = {
    source: AutomationTriggerSource.WHATSAPP,
    eventType: AutomationTriggerEvent.BUTTON_REPLY,
    resourceType: AutomationResourceType.ORDER,
    resourceId: "order_123",
    customerPhone: "919999999999",
    action: {
      type: "BUTTON_REPLY",
      actionKey: "COD_CANCEL",
      payload: "COD_CANCEL:ORDER:order_123"
    },
    data: {}
  };

  await engine.handleEvent(event, { ...incomingEvent, source: AutomationTriggerSource.WHATSAPP });

  expect(jobService.createAutomationJobAndEnqueue).not.toHaveBeenCalled();
});
