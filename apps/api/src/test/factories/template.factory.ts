export function buildTemplate(overrides: Partial<{ id: string; name: string }> = {}) {
  return { id: "template_test_1", name: "order_confirmation", ...overrides };
}
