import { HttpError } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { AuthRepository, type AdminUserRecord } from "./auth.repository.js";
import type { LoginBody, SafeAdminProfile } from "./auth.schema.js";
import { PasswordService } from "./password.service.js";
import { RefreshSessionService, type RefreshSessionContext } from "./refresh-session.service.js";
import { TokenService } from "./token.service.js";

const INVALID_CREDENTIALS_MESSAGE = "Invalid email or password.";
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

export type AuthSessionResult = {
  admin: SafeAdminProfile;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
};

export class AuthService {
  constructor(
    private readonly repository = new AuthRepository(),
    private readonly passwordService = new PasswordService(),
    private readonly tokenService = new TokenService(),
    private readonly refreshSessionService = new RefreshSessionService(repository, tokenService)
  ) {}

  async login(input: LoginBody, context: RefreshSessionContext): Promise<AuthSessionResult> {
    const email = input.email.toLowerCase();
    const admin = await this.repository.findActiveAdminByEmail(email);

    if (!admin || !admin.isActive) {
      logger.info({ event: "auth.login_failed", email });
      throw this.invalidCredentials();
    }

    if (this.isLocked(admin)) {
      logger.info({ event: "auth.login_locked", adminUserId: admin.id, email: admin.email });
      throw new HttpError(423, "Account is temporarily locked. Try again later.", "ACCOUNT_LOCKED");
    }

    const isValidPassword = await this.passwordService.verifyPassword(input.password, admin.passwordHash);

    if (!isValidPassword) {
      await this.recordFailedLogin(admin);
      logger.info({ event: "auth.login_failed", adminUserId: admin.id, email: admin.email });
      throw this.invalidCredentials();
    }

    const loggedInAt = new Date();
    const updatedAdmin = await this.repository.updateAdminLoginSuccess(admin.id, loggedInAt);
    const result = await this.issueSession(updatedAdmin, context);
    logger.info({ event: "auth.login_succeeded", adminUserId: updatedAdmin.id, email: updatedAdmin.email });
    return result;
  }

  async refresh(refreshToken: string, context: RefreshSessionContext): Promise<AuthSessionResult> {
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const session = await this.repository.findRefreshSessionByTokenHash(tokenHash);
    const now = new Date();

    if (!session || session.revokedAt || session.expiresAt <= now || !session.adminUser?.isActive) {
      throw new HttpError(401, "Invalid refresh session.", "INVALID_REFRESH_SESSION");
    }

    await this.refreshSessionService.revokeSession(session);
    return this.issueSession(session.adminUser, context);
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;

    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const session = await this.repository.findRefreshSessionByTokenHash(tokenHash);

    if (session && !session.revokedAt) {
      await this.refreshSessionService.revokeSession(session);
    }
  }

  async getAdminProfile(adminUserId: string) {
    const admin = await this.repository.findAdminById(adminUserId);

    if (!admin || !admin.isActive) {
      throw new HttpError(401, "Authentication required.", "UNAUTHORIZED");
    }

    return this.toSafeAdmin(admin);
  }

  private async issueSession(admin: AdminUserRecord, context: RefreshSessionContext): Promise<AuthSessionResult> {
    const accessToken = this.tokenService.issueAccessToken(admin);
    const { refreshToken, session } = await this.refreshSessionService.createSession(admin.id, context);

    return {
      admin: this.toSafeAdmin(admin),
      accessToken,
      refreshToken,
      refreshTokenExpiresAt: session.expiresAt
    };
  }

  private async recordFailedLogin(admin: AdminUserRecord) {
    const failedLoginCount = admin.failedLoginCount + 1;
    const lockedUntil = failedLoginCount >= MAX_FAILED_ATTEMPTS ? this.getLockoutExpiry() : null;

    await this.repository.updateAdminLoginFailure(admin.id, failedLoginCount, lockedUntil);

    if (lockedUntil) {
      logger.info({ event: "auth.account_locked", adminUserId: admin.id, email: admin.email });
    }
  }

  private isLocked(admin: AdminUserRecord) {
    return Boolean(admin.lockedUntil && admin.lockedUntil > new Date());
  }

  private getLockoutExpiry() {
    const lockedUntil = new Date();
    lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_MINUTES);
    return lockedUntil;
  }

  private invalidCredentials() {
    return new HttpError(401, INVALID_CREDENTIALS_MESSAGE, "INVALID_CREDENTIALS");
  }

  private toSafeAdmin(admin: AdminUserRecord): SafeAdminProfile {
    return {
      id: admin.id,
      email: admin.email,
      lastLoginAt: admin.lastLoginAt?.toISOString() ?? null
    };
  }
}
