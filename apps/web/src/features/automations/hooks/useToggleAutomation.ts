import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { automationApi } from "../api/automation.api";
import { automationKeys } from "../api/automation.keys";

export function useToggleAutomation(id?: string) {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ automationId, isEnabled }: { automationId?: string; isEnabled: boolean }) =>
      automationApi.toggleAutomation(automationId ?? id ?? "", { isEnabled }, { accessToken }),
    onSuccess: async (_data, variables) => {
      const automationId = variables.automationId ?? id;
      await queryClient.invalidateQueries({ queryKey: automationKeys.list() });

      if (automationId) {
        await queryClient.invalidateQueries({ queryKey: automationKeys.detail(automationId) });
      }
    }
  });
}
