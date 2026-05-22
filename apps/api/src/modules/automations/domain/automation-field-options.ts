import { AutomationFlowKey } from "@prisma/client";

export type AutomationFieldOption = {
  label: string;
  value: string;
};

export type AutomationFieldOptionGroup = {
  label: string;
  options: AutomationFieldOption[];
};

const customerFields: AutomationFieldOptionGroup = {
  label: "Customer",
  options: [
    { label: "First Name", value: "customer.firstName" },
    { label: "Last Name", value: "customer.lastName" },
    { label: "Full Name", value: "customer.fullName" },
    { label: "Phone", value: "customer.phone" },
    { label: "Email", value: "customer.email" }
  ]
};

const orderFields: AutomationFieldOptionGroup = {
  label: "Order",
  options: [
    { label: "ID", value: "order.id" },
    { label: "Name", value: "order.name" },
    { label: "Total Price", value: "order.totalPrice" },
    { label: "Currency", value: "order.currency" },
    { label: "Payment Status", value: "order.paymentStatus" },
    { label: "Fulfillment Status", value: "order.fulfillmentStatus" }
  ]
};

const shippingFields: AutomationFieldOptionGroup = {
  label: "Shipping",
  options: [
    { label: "Address 1", value: "shippingAddress.address1" },
    { label: "Address 2", value: "shippingAddress.address2" },
    { label: "City", value: "shippingAddress.city" },
    { label: "Province", value: "shippingAddress.province" },
    { label: "Country", value: "shippingAddress.country" },
    { label: "Pincode", value: "shippingAddress.pincode" }
  ]
};

const codFields: AutomationFieldOptionGroup = {
  label: "COD",
  options: [
    { label: "COD Amount", value: "order.codAmount" },
    { label: "Payment Method", value: "order.paymentMethod" },
    { label: "Confirm URL", value: "order.confirmUrl" },
    { label: "Cancel URL", value: "order.cancelUrl" }
  ]
};

const checkoutFields: AutomationFieldOptionGroup = {
  label: "Checkout",
  options: [
    { label: "ID", value: "checkout.id" },
    { label: "Total Price", value: "checkout.totalPrice" },
    { label: "Currency", value: "checkout.currency" },
    { label: "Recovery URL", value: "checkout.recoveryUrl" },
    { label: "First Product Name", value: "checkout.firstProductName" },
    { label: "Product Count", value: "checkout.productCount" }
  ]
};

export function getFieldOptionsForFlow(flowKey: AutomationFlowKey): AutomationFieldOptionGroup[] {
  if (flowKey === AutomationFlowKey.COD_FLOW) {
    return [customerFields, orderFields, shippingFields, codFields];
  }

  if (flowKey === AutomationFlowKey.ABANDONED_CART_FLOW) {
    return [customerFields, checkoutFields];
  }

  return [customerFields, orderFields, shippingFields];
}

export function getAllowedSourceFields(flowKey: AutomationFlowKey) {
  return new Set(getFieldOptionsForFlow(flowKey).flatMap((group) => group.options.map((option) => option.value)));
}
