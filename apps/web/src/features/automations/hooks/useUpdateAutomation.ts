import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { automationApi } from "../api/automation.api";
import { automationKeys } from "../api/automation.keys";
import type { UpdateAutomationPayload } from "../types/automation.types";

export function useUpdateAutomation(id: string) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAutomationPayload) => automationApi.updateAutomation(id, payload, { accessToken }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: automationKeys.list() }),
        queryClient.invalidateQueries({ queryKey: automationKeys.detail(id) })
      ]);
    }
  });
}
