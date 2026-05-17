import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { authApi } from "../api/auth.api";
import { useAuth } from "./use-auth";

export function useLogoutMutation() {
  const { clearSession } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate("/login", { replace: true });
    }
  });
}
