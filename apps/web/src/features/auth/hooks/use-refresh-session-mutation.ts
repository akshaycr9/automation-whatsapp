import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuth } from "./use-auth";

export function useRefreshSessionMutation() {
  const { clearSession, setSession } = useAuth();

  return useMutation({
    mutationFn: authApi.refreshSession,
    onError: clearSession,
    onSuccess: (session) => {
      setSession(session.admin, session.accessToken);
    }
  });
}
