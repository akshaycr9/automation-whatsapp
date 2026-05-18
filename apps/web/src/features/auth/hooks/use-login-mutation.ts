import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router";
import { authApi } from "../api/auth.api";
import { useAuth } from "./use-auth";

type LoginRedirectState = {
  from?: {
    pathname?: string;
  };
};

export function useLoginMutation() {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (session) => {
      setSession(session.admin, session.accessToken);
      const state = location.state as LoginRedirectState | null;
      navigate(state?.from?.pathname ?? "/dashboard", { replace: true });
    }
  });
}
