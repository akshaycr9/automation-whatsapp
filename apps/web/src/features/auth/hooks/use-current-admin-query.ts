import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuth } from "./use-auth";

export function useCurrentAdminQuery() {
  const { accessToken } = useAuth();

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: () => authApi.getCurrentAdmin(accessToken ?? ""),
    queryKey: ["auth", "me"],
    staleTime: 5 * 60 * 1000
  });
}
