import { z } from "zod";

export const loginBodySchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});

export type LoginBody = z.infer<typeof loginBodySchema>;

export type SafeAdminProfile = {
  id: string;
  email: string;
  lastLoginAt: string | null;
};

export type AuthResponseData = {
  admin: SafeAdminProfile;
  accessToken: string;
};
