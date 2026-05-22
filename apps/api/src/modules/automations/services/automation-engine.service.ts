import {
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource,
  type IncomingEvent
} from "@prisma/client";
import { logger } from "../../../lib/logger.js";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import { AutomationStrategyProvider } from "../providers/automation-strategy.provider.js";
import { AutomationEngineRepository, type EngineAutomation } from "../repository/automation-engine.repository.js";
import { AutomationActionStateService } from "./automation-action-state.service.js";
import { AutomationJobService } from "./automation-job.service.js";

export class AutomationEngineService {
  constructor(
    private readonly repository = new AutomationEngineRepository(),
    private readonly strategyProvider = new AutomationStrategyProvider(),
    private readonly jobService = new AutomationJobService(),
    private readonly actionStateService = new AutomationActionStateService()
  ) {}

  async handleEvent(event: InternalAutomationEvent, incomingEvent: IncomingEvent) {
    const automations = await this.getMatchingAutomations(event);
    let codStateTransitioned = false;
    let codPendingStateCreated = false;

    for (const automation of automations) {
      const strategy = this.strategyProvider.getStrategy(automation.key);
      if (!strategy) {
        logger.info({ event: "automation_strategy.missing", automationKey: automation.key });
        continue;
      }

      const canRun = await strategy.canRun(event, { automation, incomingEvent });
      if (!canRun) continue;

      if (event.eventType === AutomationTriggerEvent.COD_ORDER_CREATED && !codPendingStateCreated) {
        await this.actionStateService.createPendingCodState(event, incomingEvent);
        codPendingStateCreated = true;
      }

      if (event.eventType === AutomationTriggerEvent.BUTTON_REPLY && !codStateTransitioned) {
        const canContinue = await this.actionStateService.transitionCodState(event, incomingEvent);
        if (!canContinue) return;
        codStateTransitioned = true;
      }

      const scheduledAt = new Date(Date.now() + automation.delayMinutes * 60_000);
      await this.jobService.createAutomationJobAndEnqueue({
        automation,
        incomingEvent,
        event,
        scheduledAt,
        idempotencyKey: this.buildIdempotencyKey(event, automation)
      });
    }
  }

  private async getMatchingAutomations(event: InternalAutomationEvent): Promise<EngineAutomation[]> {
    if (event.source === AutomationTriggerSource.SHOPIFY) {
      return this.repository.findEnabledByTrigger(event.source, event.eventType);
    }

    if (event.source === AutomationTriggerSource.WHATSAPP && event.eventType === AutomationTriggerEvent.BUTTON_REPLY) {
      const actionKey = event.action?.actionKey;
      if (!actionKey) return [];

      const payload = event.action?.payload;
      const buttonAction = await this.repository.findButtonTargetAutomation({
        actionKey,
        resourceType: event.resourceType,
        ...(payload ? { payload } : {})
      });

      if (!buttonAction || !payload?.startsWith(buttonAction.payloadPrefix)) return [];

      const targetAutomation = buttonAction.targetAutomation;
      if (
        !targetAutomation.isEnabled ||
        targetAutomation.triggerSource !== AutomationTriggerSource.WHATSAPP ||
        targetAutomation.triggerEvent !== AutomationTriggerEvent.BUTTON_REPLY
      ) {
        return [];
      }

      return [targetAutomation];
    }

    return [];
  }

  private buildIdempotencyKey(event: InternalAutomationEvent, automation: EngineAutomation) {
    const resourceType = event.resourceType ?? AutomationResourceType.ORDER;
    const resourceId = event.resourceId ?? "unknown";

    if (event.source === AutomationTriggerSource.WHATSAPP) {
      return `WHATSAPP:${automation.key}:${resourceType}:${resourceId}`;
    }

    return `SHOPIFY:${automation.key}:${resourceType}:${resourceId}`;
  }
}
