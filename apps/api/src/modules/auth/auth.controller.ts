import { Request, Response } from "express";
import { HttpError } from "../../lib/http-error.js";
import { AuthService } from "./auth.service.js";
import { clearRefreshTokenCookie, REFRESH_COOKIE_NAME, setRefreshTokenCookie } from "./auth.cookies.js";
import { loginBodySchema } from "./auth.schema.js";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  login = async (req: Request, res: Response) => {
    const parsed = loginBodySchema.safeParse(req.body);

    if (!parsed.success) {
      throw new HttpError(400, "Invalid login request.", "INVALID_REQUEST");
    }

    const result = await this.authService.login(parsed.data, this.getSessionContext(req));
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.json({ data: { admin: result.admin, accessToken: result.accessToken } });
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = this.getRefreshToken(req);

    if (!refreshToken) {
      throw new HttpError(401, "Refresh token is required.", "UNAUTHORIZED");
    }

    const result = await this.authService.refresh(refreshToken, this.getSessionContext(req));
    setRefreshTokenCookie(res, result.refreshToken, result.refreshTokenExpiresAt);
    res.json({ data: { admin: result.admin, accessToken: result.accessToken } });
  };

  logout = async (req: Request, res: Response) => {
    await this.authService.logout(this.getRefreshToken(req));
    clearRefreshTokenCookie(res);
    res.json({ data: { success: true } });
  };

  me = async (req: Request, res: Response) => {
    if (!req.auth) {
      throw new HttpError(401, "Authentication required.", "UNAUTHORIZED");
    }

    const admin = await this.authService.getAdminProfile(req.auth.adminUserId);
    res.json({ data: { admin } });
  };

  private getRefreshToken(req: Request) {
    const cookies = req.cookies as Record<string, unknown> | undefined;
    const refreshToken = cookies?.[REFRESH_COOKIE_NAME];
    return typeof refreshToken === "string" ? refreshToken : undefined;
  }

  private getSessionContext(req: Request) {
    return {
      userAgent: req.get("user-agent") ?? null,
      ipAddress: req.ip ?? null
    };
  }
}
