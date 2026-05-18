import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export const safeAdminSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  lastLoginAt: z.string().datetime().nullable()
});

export const authTokenResponseSchema = z.object({
  admin: safeAdminSchema,
  accessToken: z.string().min(1)
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
