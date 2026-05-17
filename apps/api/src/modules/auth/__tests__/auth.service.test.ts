import { AuthService } from "../auth.service.js";
import { PasswordService } from "../password.service.js";
import { RefreshSessionService } from "../refresh-session.service.js";
import { TokenService } from "../token.service.js";
import { buildAdminUser } from "../../../test/factories/user.factory.js";
import { InMemoryAuthRepository } from "./auth-test-utils.js";

const sessionContext = {
  userAgent: "vitest",
  ipAddress: "127.0.0.1"
};

async function createService(password = "ValidPass@123") {
  const passwordService = new PasswordService();
  const passwordHash = await passwordService.hashPassword(password);
  const repository = new InMemoryAuthRepository([buildAdminUser({ passwordHash })]);
  const tokenService = new TokenService();
  const service = new AuthService(
    repository,
    passwordService,
    tokenService,
    new RefreshSessionService(repository, tokenService)
  );

  return { repository, service, passwordHash };
}

it("hashes and verifies password through password service", async () => {
  const passwordService = new PasswordService();
  const passwordHash = await passwordService.hashPassword("ValidPass@123");

  expect(passwordHash).not.toBe("ValidPass@123");
  await expect(passwordService.verifyPassword("ValidPass@123", passwordHash)).resolves.toBe(true);
});

it("login succeeds with valid credentials", async () => {
  const { service } = await createService();

  const result = await service.login({ email: "admin@example.com", password: "ValidPass@123" }, sessionContext);

  expect(result.admin.email).toBe("admin@example.com");
  expect(result.accessToken).toEqual(expect.any(String));
  expect(result.refreshToken).toEqual(expect.any(String));
});

it("login fails with invalid password", async () => {
  const { service } = await createService();

  await expect(service.login({ email: "admin@example.com", password: "wrong" }, sessionContext)).rejects.toMatchObject({
    code: "INVALID_CREDENTIALS"
  });
});

it("failed login increments failedLoginCount", async () => {
  const { repository, service } = await createService();

  await expect(service.login({ email: "admin@example.com", password: "wrong" }, sessionContext)).rejects.toBeTruthy();

  expect(repository.admins.get("admin_test_1")?.failedLoginCount).toBe(1);
});

it("account locks after configured failed attempts", async () => {
  const { repository, service } = await createService();

  for (let index = 0; index < 5; index += 1) {
    await expect(service.login({ email: "admin@example.com", password: "wrong" }, sessionContext)).rejects.toBeTruthy();
  }

  const admin = repository.admins.get("admin_test_1");
  expect(admin?.failedLoginCount).toBe(5);
  expect(admin?.lockedUntil).toBeInstanceOf(Date);
});

it("locked account cannot login", async () => {
  const { service } = await createService();

  for (let index = 0; index < 5; index += 1) {
    await expect(service.login({ email: "admin@example.com", password: "wrong" }, sessionContext)).rejects.toBeTruthy();
  }

  await expect(
    service.login({ email: "admin@example.com", password: "ValidPass@123" }, sessionContext)
  ).rejects.toMatchObject({
    code: "ACCOUNT_LOCKED"
  });
});

it("successful login resets failedLoginCount", async () => {
  const { repository, service } = await createService();
  repository.admins.set(
    "admin_test_1",
    buildAdminUser({
      ...repository.admins.get("admin_test_1"),
      failedLoginCount: 3
    })
  );

  await service.login({ email: "admin@example.com", password: "ValidPass@123" }, sessionContext);

  expect(repository.admins.get("admin_test_1")?.failedLoginCount).toBe(0);
  expect(repository.admins.get("admin_test_1")?.lockedUntil).toBeNull();
});

it("successful login resets failedLoginCount after lock expires", async () => {
  const { repository, service } = await createService();
  repository.admins.set(
    "admin_test_1",
    buildAdminUser({
      ...repository.admins.get("admin_test_1"),
      failedLoginCount: 5,
      lockedUntil: new Date("2020-01-01T00:00:00.000Z")
    })
  );

  await service.login({ email: "admin@example.com", password: "ValidPass@123" }, sessionContext);

  expect(repository.admins.get("admin_test_1")?.failedLoginCount).toBe(0);
  expect(repository.admins.get("admin_test_1")?.lockedUntil).toBeNull();
});

it("inactive admin cannot login", async () => {
  const { repository, service } = await createService();
  repository.admins.set("admin_test_1", buildAdminUser({ ...repository.admins.get("admin_test_1"), isActive: false }));

  await expect(
    service.login({ email: "admin@example.com", password: "ValidPass@123" }, sessionContext)
  ).rejects.toMatchObject({
    code: "INVALID_CREDENTIALS"
  });
});

it("refresh token is stored hashed, not plaintext", async () => {
  const { repository, service } = await createService();

  const result = await service.login({ email: "admin@example.com", password: "ValidPass@123" }, sessionContext);
  const session = [...repository.refreshSessions.values()][0];

  expect(session?.tokenHash).toEqual(expect.any(String));
  expect(session?.tokenHash).not.toBe(result.refreshToken);
});

it("refresh token rotation revokes old session", async () => {
  const { repository, service } = await createService();
  const loginResult = await service.login({ email: "admin@example.com", password: "ValidPass@123" }, sessionContext);
  const oldSession = [...repository.refreshSessions.values()][0];

  await service.refresh(loginResult.refreshToken, sessionContext);

  expect(repository.refreshSessions.get(oldSession?.tokenHash ?? "")?.revokedAt).toBeInstanceOf(Date);
  expect(repository.refreshSessions.size).toBe(2);
});

it("logout revokes refresh session", async () => {
  const { repository, service } = await createService();
  const loginResult = await service.login({ email: "admin@example.com", password: "ValidPass@123" }, sessionContext);

  await service.logout(loginResult.refreshToken);

  expect([...repository.refreshSessions.values()][0]?.revokedAt).toBeInstanceOf(Date);
});
