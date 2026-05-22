import {
  AutomationActionStateValue,
  AutomationFlowKey,
  AutomationJobStatus,
  AutomationKey,
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource,
  TemplateStatus
} from "@prisma/client";
import { AutomationSendConditionService } from "../services/automation-send-condition.service.js";

function createJob(overrides: Record<string, unknown> = {}) {
  return {
    id: "automation_job_123",
    status: AutomationJobStatus.QUEUED,
    resourceType: AutomationResourceType.ORDER,
    resourceId: "order_123",
    customerPhone: "919999999999",
    incomingEvent: { id: "incoming_123" },
    automation: {
      key: AutomationKey.COD_ORDER_FOLLOW_UP,
      isEnabled: true,
      templateId: "template_123",
      template: {
        id: "template_123",
        status: TemplateStatus.APPROVED
      }
    },
    ...overrides
  };
}

const event = {
  source: AutomationTriggerSource.SHOPIFY,
  eventType: AutomationTriggerEvent.COD_ORDER_CREATED,
  resourceType: AutomationResourceType.ORDER,
  resourceId: "order_123",
  customerPhone: "919999999999",
  data: {}
};

it("skips COD follow-up when the order is already confirmed", async () => {
  const actionStates = {
    findByFlowResource: vi.fn().mockResolvedValue({
      flowKey: AutomationFlowKey.COD_FLOW,
      state: AutomationActionStateValue.CONFIRMED
    })
  };

  await expect(
    new AutomationSendConditionService(actionStates as never).canSend(createJob() as never, event)
  ).resolves.toEqual({
    canSend: false,
    reason: "COD order is already confirmed."
  });
});

it("allows COD follow-up while pending confirmation", async () => {
  const actionStates = {
    findByFlowResource: vi.fn().mockResolvedValue({
      flowKey: AutomationFlowKey.COD_FLOW,
      state: AutomationActionStateValue.PENDING_CONFIRMATION
    })
  };

  await expect(
    new AutomationSendConditionService(actionStates as never).canSend(createJob() as never, event)
  ).resolves.toEqual({
    canSend: true
  });
});

it("skips disabled automations", async () => {
  await expect(
    new AutomationSendConditionService({ findByFlowResource: vi.fn() } as never).canSend(
      createJob({
        automation: {
          ...createJob().automation,
          isEnabled: false
        }
      }) as never,
      event
    )
  ).resolves.toEqual({
    canSend: false,
    reason: "Automation is disabled."
  });
});
