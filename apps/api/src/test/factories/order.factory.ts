export function buildOrder(overrides: Partial<{ id: string; shopifyOrderId: string }> = {}) {
  return {
    id: "order_test_1",
    shopifyOrderId: "shopify_order_1",
    ...overrides
  };
}
