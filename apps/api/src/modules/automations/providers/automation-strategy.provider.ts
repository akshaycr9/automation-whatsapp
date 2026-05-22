import { AutomationKey } from "@prisma/client";
import { AbandonedCart1Strategy } from "../strategies/abandoned-cart-1.strategy.js";
import { AbandonedCart2Strategy } from "../strategies/abandoned-cart-2.strategy.js";
import { AbandonedCart3Strategy } from "../strategies/abandoned-cart-3.strategy.js";
import type { AutomationStrategy } from "../strategies/automation-strategy.interface.js";
import { CodOrderCancelledStrategy } from "../strategies/cod-order-cancelled.strategy.js";
import { CodOrderConfirmationStrategy } from "../strategies/cod-order-confirmation.strategy.js";
import { CodOrderConfirmedStrategy } from "../strategies/cod-order-confirmed.strategy.js";
import { CodOrderFollowupStrategy } from "../strategies/cod-order-followup.strategy.js";
import { OrderCancelledStrategy } from "../strategies/order-cancelled.strategy.js";
import { OrderConfirmedStrategy } from "../strategies/order-confirmed.strategy.js";
import { OrderFulfilledStrategy } from "../strategies/order-fulfilled.strategy.js";

export class AutomationStrategyProvider {
  private readonly strategies: Map<AutomationKey, AutomationStrategy>;

  constructor(
    strategies: AutomationStrategy[] = [
      new OrderConfirmedStrategy(),
      new OrderFulfilledStrategy(),
      new OrderCancelledStrategy(),
      new CodOrderConfirmationStrategy(),
      new CodOrderConfirmedStrategy(),
      new CodOrderCancelledStrategy(),
      new CodOrderFollowupStrategy(),
      new AbandonedCart1Strategy(),
      new AbandonedCart2Strategy(),
      new AbandonedCart3Strategy()
    ]
  ) {
    this.strategies = new Map(strategies.map((strategy) => [strategy.key, strategy]));
  }

  getStrategy(key: AutomationKey) {
    return this.strategies.get(key);
  }
}
