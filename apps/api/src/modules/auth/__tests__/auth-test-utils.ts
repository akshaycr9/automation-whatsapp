import { AuthRepository, type AdminUserRecord, type RefreshSessionRecord } from "../auth.repository.js";
import { buildAdminUser } from "../../../test/factories/user.factory.js";

export class InMemoryAuthRepository extends AuthRepository {
  admins = new Map<string, AdminUserRecord>();
  refreshSessions = new Map<string, RefreshSessionRecord>();

  constructor(admins: AdminUserRecord[] = [buildAdminUser()]) {
    super({
      adminUser: {
        findUnique: async ({ where }) => {
          if (where.id) return this.admins.get(where.id) ?? null;
          if (where.email) return [...this.admins.values()].find((admin) => admin.email === where.email) ?? null;
          return null;
        },
        update: async ({ where, data }) => {
          const admin = this.admins.get(where.id);
          if (!admin) throw new Error("Admin not found");
          const updated = { ...admin, ...data, updatedAt: new Date() };
          this.admins.set(admin.id, updated);
          return updated;
        }
      },
      refreshSession: {
        create: async ({ data }) => {
          const session: RefreshSessionRecord = {
            id: `refresh_${this.refreshSessions.size + 1}`,
            adminUserId: data.adminUserId,
            tokenHash: data.tokenHash,
            userAgent: data.userAgent ?? null,
            ipAddress: data.ipAddress ?? null,
            expiresAt: data.expiresAt,
            revokedAt: null,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          this.refreshSessions.set(session.tokenHash, session);
          return session;
        },
        findUnique: async ({ where, include }) => {
          const session = this.refreshSessions.get(where.tokenHash);
          if (!session) return null;
          const adminUser = this.admins.get(session.adminUserId);
          return include?.adminUser && adminUser ? { ...session, adminUser } : session;
        },
        update: async ({ where, data }) => {
          const session = [...this.refreshSessions.values()].find((value) => value.id === where.id);
          if (!session) throw new Error("Refresh session not found");
          const updated = { ...session, ...data, updatedAt: new Date() };
          this.refreshSessions.set(updated.tokenHash, updated);
          return updated;
        }
      }
    });

    for (const admin of admins) {
      this.admins.set(admin.id, admin);
    }
  }
}
