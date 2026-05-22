export const automationKeys = {
  all: ["automations"] as const,
  list: () => [...automationKeys.all, "list"] as const,
  details: () => [...automationKeys.all, "detail"] as const,
  detail: (id: string) => [...automationKeys.details(), id] as const,
  fieldOptions: (id: string) => [...automationKeys.detail(id), "field-options"] as const
};
