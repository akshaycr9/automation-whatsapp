import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { PasswordService } from "../apps/api/src/modules/auth/password.service.js";

type AdminUserSeedStore = {
  adminUser: {
    count(): Promise<number>;
    findUnique(args: { where: { email: string } }): Promise<{ id: string } | null>;
    create(args: { data: { email: string; passwordHash: string; isActive: boolean } }): Promise<{ id: string }>;
    update(args: {
      where: { email: string };
      data: { passwordHash: string; isActive: boolean; failedLoginCount: number; lockedUntil: null };
    }): Promise<{ id: string }>;
  };
};

const seedEnvSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1)
});

const prisma = new PrismaClient() as unknown as AdminUserSeedStore;

async function main() {
  const seedEnv = seedEnvSchema.safeParse(process.env);

  if (!seedEnv.success) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin user.");
  }

  const email = seedEnv.data.ADMIN_EMAIL.toLowerCase();
  const passwordService = new PasswordService();
  const passwordHash = await passwordService.hashPassword(seedEnv.data.ADMIN_PASSWORD);
  const existingAdmin = await prisma.adminUser.findUnique({ where: { email } });

  if (existingAdmin) {
    await prisma.adminUser.update({
      where: { email },
      data: {
        passwordHash,
        isActive: true,
        failedLoginCount: 0,
        lockedUntil: null
      }
    });
    console.log(`Admin user updated: ${email}`);
    return;
  }

  const adminCount = await prisma.adminUser.count();

  if (adminCount > 0) {
    throw new Error("An admin user already exists. Refusing to create a second admin for the single-admin MVP.");
  }

  await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      isActive: true
    }
  });

  console.log(`Admin user created: ${email}`);
}

void main();
