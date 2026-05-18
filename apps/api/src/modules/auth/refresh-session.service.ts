import { AuthRepository, type RefreshSessionRecord } from "./auth.repository.js";
import { TokenService } from "./token.service.js";

export type RefreshSessionContext = {
  userAgent: string | null;
  ipAddress: string | null;
};

export class RefreshSessionService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenService: TokenService
  ) {}

  async createSession(adminUserId: string, context: RefreshSessionContext) {
    const refreshToken = this.tokenService.createRefreshToken();
    const tokenHash = this.tokenService.hashRefreshToken(refreshToken);
    const expiresAt = this.tokenService.getRefreshExpiry();
    const session = await this.repository.createRefreshSession({
      adminUserId,
      tokenHash,
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt
    });

    return { refreshToken, session };
  }

  async revokeSession(session: RefreshSessionRecord) {
    return this.repository.revokeRefreshSession(session.id);
  }
}
