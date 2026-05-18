import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),
  WEB_APP_URL: z.string().url().default("http://localhost:5173"),
  API_URL: z.string().url().default("http://localhost:4000"),
  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(30),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true")
});

const parsedEnv = envSchema.parse(process.env);

if (parsedEnv.NODE_ENV !== "test" && !parsedEnv.JWT_ACCESS_SECRET) {
  throw new Error("JWT_ACCESS_SECRET is required");
}

export const env = {
  ...parsedEnv,
  JWT_ACCESS_SECRET: parsedEnv.JWT_ACCESS_SECRET ?? "test-access-secret-for-authentication-tests",
  COOKIE_SECURE: parsedEnv.COOKIE_SECURE ?? parsedEnv.NODE_ENV === "production"
};
