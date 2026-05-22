import { AutomationKey, AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import {
  hasRunnableConfiguration,
  type AutomationStrategy,
  type AutomationStrategyContext
} from "./automation-strategy.interface.js";

export class OrderConfirmedStrategy implements AutomationStrategy {
  key = AutomationKey.ORDER_CONFIRMED;

  async canRun(event: InternalAutomationEvent, context: AutomationStrategyContext) {
    return (
      event.source === AutomationTriggerSource.SHOPIFY &&
      event.eventType === AutomationTriggerEvent.ORDER_CREATED &&
      event.resourceType === AutomationResourceType.ORDER &&
      hasRunnableConfiguration(event, context)
    );
  }
}
