import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { authApi } from "./api/auth.api";
import { AuthContext } from "./auth-context";
import type { AdminProfile } from "./types";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const queryClient = useQueryClient();
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isBootstrappingAuth, setIsBootstrappingAuth] = useState(true);

  const setSession = useCallback((nextAdmin: AdminProfile, nextAccessToken: string) => {
    setAdmin(nextAdmin);
    setAccessToken(nextAccessToken);
  }, []);

  const clearSession = useCallback(() => {
    setAdmin(null);
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: ["auth"] });
  }, [queryClient]);

  const refreshMutation = useMutation({
    mutationFn: authApi.refreshSession,
    onError: () => {
      clearSession();
    },
    onSuccess: (session) => {
      setSession(session.admin, session.accessToken);
    },
    onSettled: () => {
      setIsBootstrappingAuth(false);
    }
  });

  useEffect(() => {
    refreshMutation.mutate();
  }, []);

  const value = useMemo(
    () => ({
      accessToken,
      admin,
      clearSession,
      isAuthenticated: Boolean(admin && accessToken),
      isBootstrappingAuth,
      setSession
    }),
    [accessToken, admin, clearSession, isBootstrappingAuth, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
