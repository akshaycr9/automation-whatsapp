import { Response } from "express";
import { env } from "../../config/env.js";

export const REFRESH_COOKIE_NAME = "qw_refresh_token";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: env.COOKIE_SECURE,
  path: "/api/auth"
};

export function setRefreshTokenCookie(res: Response, token: string, expiresAt: Date) {
  const maxAge = Math.max(expiresAt.getTime() - Date.now(), 0);

  res.cookie(REFRESH_COOKIE_NAME, token, {
    ...cookieOptions,
    expires: expiresAt,
    maxAge
  });
}

export function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions);
}
