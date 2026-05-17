import express from "express";
import jwt from "jsonwebtoken";
import request from "supertest";
import { env } from "../../../config/env.js";
import { errorHandler } from "../../../middleware/error-handler.js";
import { buildAdminUser } from "../../../test/factories/user.factory.js";
import { createAuthMiddleware } from "../auth.middleware.js";
import { TokenService } from "../token.service.js";
import { InMemoryAuthRepository } from "./auth-test-utils.js";

function createMiddlewareTestApp(repository = new InMemoryAuthRepository()) {
  const app = express();
  app.get("/protected", createAuthMiddleware(new TokenService(), repository), (req, res) => {
    res.json({ data: { auth: req.auth } });
  });
  app.use(errorHandler);
  return { app, repository };
}

it("rejects missing token", async () => {
  const { app } = createMiddlewareTestApp();

  const response = await request(app).get("/protected").expect(401);

  expect(response.body.error.code).toBe("UNAUTHORIZED");
});

it("rejects malformed token", async () => {
  const { app } = createMiddlewareTestApp();

  await request(app).get("/protected").set("Authorization", "Bearer not-a-token").expect(401);
});

it("rejects expired token if practical", async () => {
  const { app } = createMiddlewareTestApp();
  const expiredToken = jwt.sign(
    { sub: "admin_test_1", email: "admin@example.com", type: "access" },
    env.JWT_ACCESS_SECRET,
    { algorithm: "HS256", expiresIn: -1 }
  );

  await request(app).get("/protected").set("Authorization", `Bearer ${expiredToken}`).expect(401);
});

it("rejects invalid token type", async () => {
  const { app } = createMiddlewareTestApp();
  const refreshTypeToken = jwt.sign(
    { sub: "admin_test_1", email: "admin@example.com", type: "refresh" },
    env.JWT_ACCESS_SECRET,
    { algorithm: "HS256", expiresIn: "15m" }
  );

  await request(app).get("/protected").set("Authorization", `Bearer ${refreshTypeToken}`).expect(401);
});

it("rejects inactive admin", async () => {
  const repository = new InMemoryAuthRepository([buildAdminUser({ isActive: false })]);
  const { app } = createMiddlewareTestApp(repository);
  const token = new TokenService().issueAccessToken({ id: "admin_test_1", email: "admin@example.com" });

  await request(app).get("/protected").set("Authorization", `Bearer ${token}`).expect(401);
});

it("attaches auth context for valid token", async () => {
  const { app } = createMiddlewareTestApp();
  const token = new TokenService().issueAccessToken({ id: "admin_test_1", email: "admin@example.com" });

  const response = await request(app).get("/protected").set("Authorization", `Bearer ${token}`).expect(200);

  expect(response.body.data.auth).toEqual({
    adminUserId: "admin_test_1",
    email: "admin@example.com"
  });
});
