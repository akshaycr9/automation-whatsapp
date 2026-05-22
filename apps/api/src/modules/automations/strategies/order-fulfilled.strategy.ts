import { AutomationKey, AutomationResourceType, AutomationTriggerEvent, AutomationTriggerSource } from "@prisma/client";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import {
  hasRunnableConfiguration,
  type AutomationStrategy,
  type AutomationStrategyContext
} from "./automation-strategy.interface.js";

export class OrderFulfilledStrategy implements AutomationStrategy {
  key = AutomationKey.ORDER_FULFILLED;

  async canRun(event: InternalAutomationEvent, context: AutomationStrategyContext) {
    return (
      event.source === AutomationTriggerSource.SHOPIFY &&
      event.eventType === AutomationTriggerEvent.ORDER_FULFILLED &&
      event.resourceType === AutomationResourceType.ORDER &&
      hasRunnableConfiguration(event, context)
    );
  }
}
