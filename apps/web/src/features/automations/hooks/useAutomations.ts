import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { automationApi } from "../api/automation.api";
import { automationKeys } from "../api/automation.keys";

export function useAutomations() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: automationKeys.list(),
    queryFn: () => automationApi.getAutomations({ accessToken }),
    enabled: Boolean(accessToken)
  });
}
