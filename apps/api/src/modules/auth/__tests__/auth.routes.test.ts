import cookieParser from "cookie-parser";
import express from "express";
import request from "supertest";
import { errorHandler } from "../../../middleware/error-handler.js";
import { getCookieValue } from "../../../test/test-utils.js";
import { AuthController } from "../auth.controller.js";
import { REFRESH_COOKIE_NAME } from "../auth.cookies.js";
import { createAuthMiddleware } from "../auth.middleware.js";
import { AuthService } from "../auth.service.js";
import { PasswordService } from "../password.service.js";
import { RefreshSessionService } from "../refresh-session.service.js";
import { createAuthRoutes } from "../auth.routes.js";
import { TokenService } from "../token.service.js";
import { InMemoryAuthRepository } from "./auth-test-utils.js";

async function createRoutesTestApp(password = "ValidPass@123") {
  const passwordService = new PasswordService();
  const passwordHash = await passwordService.hashPassword(password);
  const repository = new InMemoryAuthRepository([
    {
      id: "admin_test_1",
      email: "admin@example.com",
      passwordHash,
      isActive: true,
      failedLoginCount: 0,
      lockedUntil: null,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const tokenService = new TokenService();
  const authService = new AuthService(
    repository,
    passwordService,
    tokenService,
    new RefreshSessionService(repository, tokenService)
  );
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  app.use(
    "/api/auth",
    createAuthRoutes(new AuthController(authService), createAuthMiddleware(tokenService, repository))
  );
  app.use(errorHandler);

  return { app, repository };
}

it("POST /api/auth/login returns access token and safe admin profile", async () => {
  const { app } = await createRoutesTestApp();

  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@example.com", password: "ValidPass@123" })
    .expect(200);

  expect(response.body.data.accessToken).toEqual(expect.any(String));
  expect(response.body.data.admin).toEqual({
    id: "admin_test_1",
    email: "admin@example.com",
    lastLoginAt: expect.any(String)
  });
  expect(response.body.data.admin.passwordHash).toBeUndefined();
});

it("POST /api/auth/login sets httpOnly refresh cookie", async () => {
  const { app } = await createRoutesTestApp();

  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@example.com", password: "ValidPass@123" })
    .expect(200);

  const cookie = response.headers["set-cookie"] as string[] | undefined;
  expect(cookie?.some((value) => value.includes(`${REFRESH_COOKIE_NAME}=`))).toBe(true);
  expect(cookie?.some((value) => value.includes("HttpOnly"))).toBe(true);
});

it("POST /api/auth/login rejects invalid body", async () => {
  const { app } = await createRoutesTestApp();

  const response = await request(app).post("/api/auth/login").send({ email: "not-email" }).expect(400);

  expect(response.body.error.code).toBe("INVALID_REQUEST");
});

it("POST /api/auth/login uses generic invalid credentials response", async () => {
  const { app } = await createRoutesTestApp();

  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "missing@example.com", password: "wrong" })
    .expect(401);

  expect(response.body.error).toEqual({
    code: "INVALID_CREDENTIALS",
    message: "Invalid email or password."
  });
});

it("POST /api/auth/refresh returns new access token with valid cookie", async () => {
  const { app } = await createRoutesTestApp();
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@example.com", password: "ValidPass@123" })
    .expect(200);
  const refreshToken = getCookieValue(loginResponse.headers["set-cookie"] as string[] | undefined, REFRESH_COOKIE_NAME);

  const response = await request(app)
    .post("/api/auth/refresh")
    .set("Cookie", `${REFRESH_COOKIE_NAME}=${refreshToken}`)
    .expect(200);

  expect(response.body.data.accessToken).toEqual(expect.any(String));
  expect(response.body.data.admin.email).toBe("admin@example.com");
});

it("POST /api/auth/refresh rejects missing/invalid cookie", async () => {
  const { app } = await createRoutesTestApp();

  await request(app).post("/api/auth/refresh").expect(401);
  await request(app).post("/api/auth/refresh").set("Cookie", `${REFRESH_COOKIE_NAME}=invalid`).expect(401);
});

it("POST /api/auth/logout clears cookie", async () => {
  const { app } = await createRoutesTestApp();

  const response = await request(app).post("/api/auth/logout").expect(200);
  const cookies = response.headers["set-cookie"] as string[] | undefined;

  expect(cookies?.some((value) => value.includes(`${REFRESH_COOKIE_NAME}=`))).toBe(true);
});

it("GET /api/auth/me requires bearer token", async () => {
  const { app } = await createRoutesTestApp();

  await request(app).get("/api/auth/me").expect(401);
});

it("GET /api/auth/me returns admin with valid token", async () => {
  const { app } = await createRoutesTestApp();
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({ email: "admin@example.com", password: "ValidPass@123" })
    .expect(200);

  const response = await request(app)
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${loginResponse.body.data.accessToken}`)
    .expect(200);

  expect(response.body.data.admin.email).toBe("admin@example.com");
});

it("GET /api/auth/me rejects invalid token", async () => {
  const { app } = await createRoutesTestApp();

  await request(app).get("/api/auth/me").set("Authorization", "Bearer invalid").expect(401);
});
