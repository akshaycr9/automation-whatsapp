import { AutomationKey, AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import {
  hasRunnableConfiguration,
  type AutomationStrategy,
  type AutomationStrategyContext
} from "./automation-strategy.interface.js";

export class CodOrderFollowupStrategy implements AutomationStrategy {
  key = AutomationKey.COD_ORDER_FOLLOW_UP;

  async canRun(event: InternalAutomationEvent, context: AutomationStrategyContext) {
    return (
      event.source === AutomationTriggerSource.SHOPIFY &&
      event.eventType === AutomationTriggerEvent.COD_ORDER_CREATED &&
      event.resourceType === AutomationResourceType.ORDER &&
      hasRunnableConfiguration(event, context)
    );
  }
}
