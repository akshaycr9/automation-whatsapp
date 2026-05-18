export function buildUser(overrides: Partial<{ id: string; email: string }> = {}) {
  return { id: "user_test_1", email: "admin@example.com", ...overrides };
}

export function buildAdminUser(
  overrides: Partial<{
    id: string;
    email: string;
    passwordHash: string;
    isActive: boolean;
    failedLoginCount: number;
    lockedUntil: Date | null;
    lastLoginAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: "admin_test_1",
    email: "admin@example.com",
    passwordHash: "$2a$12$placeholder",
    isActive: true,
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}
