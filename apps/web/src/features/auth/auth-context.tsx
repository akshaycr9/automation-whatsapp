import { createContext } from "react";
import type { AdminProfile } from "./types";

export type AuthContextValue = {
  accessToken: string | null;
  admin: AdminProfile | null;
  clearSession: (options?: { message?: string | null }) => void;
  isAuthenticated: boolean;
  isBootstrappingAuth: boolean;
  sessionMessage: string | null;
  setSession: (admin: AdminProfile, accessToken: string) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
