import { Card } from "@/components/ui/card";
import type { AutomationDetail } from "../types/automation.types";
import { AutomationIcon } from "./AutomationIcon";

type AutomationConditionsCardProps = {
  automation: AutomationDetail;
};

export function AutomationConditionsCard({ automation }: AutomationConditionsCardProps) {
  const conditions = [
    "Customer phone number must exist.",
    "Selected WhatsApp template must be approved.",
    "Automation must remain enabled at send time.",
    ...getFlowConditions(automation)
  ];

  return (
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold text-text">Conditions</h2>
      <div className="space-y-2">
        {conditions.map((condition) => (
          <div key={condition} className="flex gap-2 text-sm text-text">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-hover">
              <AutomationIcon className="size-3" name="check" />
            </span>
            <span>{condition}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function getFlowConditions(automation: AutomationDetail) {
  if (automation.key === "COD_ORDER_FOLLOW_UP") {
    return ["Customer must not have already confirmed or cancelled the order."];
  }

  if (automation.flow.key === "ABANDONED_CART_FLOW") {
    return ["Checkout must not have converted into an order before message is sent."];
  }

  if (automation.flow.key === "ORDER_FLOW") {
    return ["Shopify order status must match the trigger event."];
  }

  return [];
}
