export type MetaWebhookChange = {
  field?: string;
  value?: Record<string, unknown>;
};

export type MetaWebhookEntry = {
  id?: string;
  changes?: MetaWebhookChange[];
};

export type MetaWebhookPayload = {
  entry?: MetaWebhookEntry[];
};

export type MetaWebhookHandlerResult = {
  processedCount: number;
  ignoredCount?: number;
};

export interface MetaWebhookFieldHandler {
  readonly field: string;
  handle(payload: MetaWebhookPayload): Promise<MetaWebhookHandlerResult>;
}
