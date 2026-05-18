import { apiClient } from "@/lib/api-client";
import type { AdminProfile, AuthSession, LoginInput } from "../types";

type AuthSessionPayload = AuthSession;
type CurrentAdminPayload = {
  admin: AdminProfile;
};

export const authApi = {
  async login(input: LoginInput) {
    const response = await apiClient.post<AuthSessionPayload>("/api/auth/login", input, {
      credentials: "include"
    });
    return response.data;
  },

  async refreshSession() {
    const response = await apiClient.post<AuthSessionPayload>("/api/auth/refresh", undefined, {
      credentials: "include"
    });
    return response.data;
  },

  async logout() {
    await apiClient.post<{ success: boolean }>("/api/auth/logout", undefined, {
      credentials: "include"
    });
  },

  async getCurrentAdmin(accessToken: string) {
    const response = await apiClient.get<CurrentAdminPayload>("/api/auth/me", {
      accessToken,
      credentials: "include"
    });
    return response.data.admin;
  }
};
