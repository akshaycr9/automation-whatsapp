import { RequestHandler } from "express";
import { HttpError } from "../../lib/http-error.js";
import { AuthRepository } from "./auth.repository.js";
import { TokenService } from "./token.service.js";

declare global {
  // Express exposes request augmentation through the global Express namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: {
        adminUserId: string;
        email: string;
      };
    }
  }
}

export function createAuthMiddleware(
  tokenService = new TokenService(),
  repository = new AuthRepository()
): RequestHandler {
  return async (req, _res, next) => {
    try {
      const token = extractBearerToken(req.get("authorization"));

      if (!token) {
        throw unauthorized();
      }

      const payload = tokenService.verifyAccessToken(token);
      const admin = await repository.findAdminById(payload.sub);

      if (!admin || !admin.isActive) {
        throw unauthorized();
      }

      req.auth = {
        adminUserId: admin.id,
        email: admin.email
      };
      next();
    } catch {
      next(unauthorized());
    }
  };
}

function extractBearerToken(authorizationHeader: string | undefined) {
  if (!authorizationHeader?.startsWith("Bearer ")) return null;
  const token = authorizationHeader.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

function unauthorized() {
  return new HttpError(401, "Authentication required.", "UNAUTHORIZED");
}
