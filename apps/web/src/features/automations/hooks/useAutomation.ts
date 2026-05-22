import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { automationApi } from "../api/automation.api";
import { automationKeys } from "../api/automation.keys";

export function useAutomation(id: string | undefined) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: automationKeys.detail(id ?? ""),
    queryFn: () => automationApi.getAutomation(id ?? "", { accessToken }),
    enabled: Boolean(accessToken && id)
  });
}
