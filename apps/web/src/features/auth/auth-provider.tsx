import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { setUnauthorizedHandler } from "@/lib/api-client";
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
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null);

  const setSession = useCallback((nextAdmin: AdminProfile, nextAccessToken: string) => {
    setAdmin(nextAdmin);
    setAccessToken(nextAccessToken);
    setSessionMessage(null);
  }, []);

  const clearSession = useCallback(
    (options?: { message?: string | null }) => {
      setAdmin(null);
      setAccessToken(null);
      setSessionMessage(options?.message ?? null);
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
    [queryClient]
  );

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

  const recoverUnauthorizedSession = useCallback(async () => {
    if (!refreshInFlightRef.current) {
      refreshInFlightRef.current = authApi
        .refreshSession()
        .then((session) => {
          setSession(session.admin, session.accessToken);
          return session.accessToken;
        })
        .catch(() => {
          clearSession({ message: "Your session expired. Please log in again." });
          queryClient.clear();
          return null;
        })
        .finally(() => {
          refreshInFlightRef.current = null;
        });
    }

    return refreshInFlightRef.current;
  }, [clearSession, queryClient, setSession]);

  useEffect(() => {
    setUnauthorizedHandler(recoverUnauthorizedSession);

    return () => {
      setUnauthorizedHandler(null);
    };
  }, [recoverUnauthorizedSession]);

  const value = useMemo(
    () => ({
      accessToken,
      admin,
      clearSession,
      isAuthenticated: Boolean(admin && accessToken),
      isBootstrappingAuth,
      sessionMessage,
      setSession
    }),
    [accessToken, admin, clearSession, isBootstrappingAuth, sessionMessage, setSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
