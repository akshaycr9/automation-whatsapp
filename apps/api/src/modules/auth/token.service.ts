import crypto from "node:crypto";
import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../../config/env.js";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  type: "access";
};

type JwtExpiresIn = NonNullable<SignOptions["expiresIn"]>;

export class TokenService {
  issueAccessToken(admin: { id: string; email: string }) {
    const payload: AccessTokenPayload = {
      sub: admin.id,
      email: admin.email,
      type: "access"
    };
    const options: SignOptions = {
      algorithm: "HS256",
      expiresIn: env.ACCESS_TOKEN_TTL as JwtExpiresIn
    };

    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
  }

  verifyAccessToken(token: string) {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      algorithms: ["HS256"]
    });

    if (!this.isAccessTokenPayload(decoded)) {
      throw new Error("Invalid access token payload");
    }

    return decoded;
  }

  createRefreshToken() {
    return crypto.randomBytes(48).toString("base64url");
  }

  hashRefreshToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  getRefreshExpiry(now = new Date()) {
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + env.REFRESH_TOKEN_TTL_DAYS);
    return expiresAt;
  }

  private isAccessTokenPayload(decoded: unknown): decoded is AccessTokenPayload {
    if (typeof decoded !== "object" || decoded === null) return false;
    const payload = decoded as Record<string, unknown>;
    return typeof payload.sub === "string" && typeof payload.email === "string" && payload.type === "access";
  }
}
