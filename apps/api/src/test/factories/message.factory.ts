export function buildMessage(overrides: Partial<{ id: string; body: string }> = {}) {
  return { id: "message_test_1", body: "Hello", ...overrides };
}
