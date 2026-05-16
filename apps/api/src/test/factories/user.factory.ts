export function buildUser(overrides: Partial<{ id: string; email: string }> = {}) {
  return { id: "user_test_1", email: "admin@example.com", ...overrides };
}
