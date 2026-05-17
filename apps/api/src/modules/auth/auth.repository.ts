import { PrismaClient } from "@prisma/client";

export type AdminUserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  failedLoginCount: number;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type RefreshSessionRecord = {
  id: string;
  adminUserId: string;
  tokenHash: string;
  userAgent: string | null;
  ipAddress: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  adminUser?: AdminUserRecord;
};

type AdminUserDelegate = {
  findUnique(args: { where: { email?: string; id?: string } }): Promise<AdminUserRecord | null>;
  update(args: {
    where: { id: string };
    data: Partial<
      Pick<AdminUserRecord, "failedLoginCount" | "lockedUntil" | "lastLoginAt" | "passwordHash" | "isActive">
    >;
  }): Promise<AdminUserRecord>;
};

type RefreshSessionDelegate = {
  create(args: {
    data: Pick<RefreshSessionRecord, "adminUserId" | "tokenHash" | "expiresAt"> &
      Partial<Pick<RefreshSessionRecord, "userAgent" | "ipAddress">>;
  }): Promise<RefreshSessionRecord>;
  findUnique(args: {
    where: { tokenHash: string };
    include?: { adminUser?: boolean };
  }): Promise<RefreshSessionRecord | null>;
  update(args: {
    where: { id: string };
    data: Partial<Pick<RefreshSessionRecord, "revokedAt">>;
  }): Promise<RefreshSessionRecord>;
};

export type AuthDataStore = {
  adminUser: AdminUserDelegate;
  refreshSession: RefreshSessionDelegate;
};

const prisma = new PrismaClient() as unknown as AuthDataStore;

export class AuthRepository {
  constructor(private readonly db: AuthDataStore = prisma) {}

  findActiveAdminByEmail(email: string) {
    return this.db.adminUser.findUnique({ where: { email } });
  }

  findAdminById(id: string) {
    return this.db.adminUser.findUnique({ where: { id } });
  }

  updateAdminLoginFailure(adminUserId: string, failedLoginCount: number, lockedUntil: Date | null) {
    return this.db.adminUser.update({
      where: { id: adminUserId },
      data: { failedLoginCount, lockedUntil }
    });
  }

  updateAdminLoginSuccess(adminUserId: string, lastLoginAt: Date) {
    return this.db.adminUser.update({
      where: { id: adminUserId },
      data: { failedLoginCount: 0, lastLoginAt, lockedUntil: null }
    });
  }

  createRefreshSession(input: {
    adminUserId: string;
    tokenHash: string;
    userAgent?: string | null;
    ipAddress?: string | null;
    expiresAt: Date;
  }) {
    return this.db.refreshSession.create({
      data: {
        adminUserId: input.adminUserId,
        tokenHash: input.tokenHash,
        userAgent: input.userAgent ?? null,
        ipAddress: input.ipAddress ?? null,
        expiresAt: input.expiresAt
      }
    });
  }

  findRefreshSessionByTokenHash(tokenHash: string) {
    return this.db.refreshSession.findUnique({
      where: { tokenHash },
      include: { adminUser: true }
    });
  }

  revokeRefreshSession(refreshSessionId: string, revokedAt = new Date()) {
    return this.db.refreshSession.update({
      where: { id: refreshSessionId },
      data: { revokedAt }
    });
  }
}
