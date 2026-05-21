import type { JobsOptions, RedisOptions } from "bullmq";

export type QueueName = "automation-events-queue" | "automation-send-queue";

export type AutomationEventJobPayload = {
  incomingEventId: string;
};

export type AutomationSendJobPayload = {
  automationJobId: string;
};

export type AddAutomationEventJobInput = AutomationEventJobPayload & {
  idempotencyKey?: string;
};

export type AddAutomationSendJobInput = AutomationSendJobPayload & {
  idempotencyKey?: string;
  delayMs?: number;
};

export type QueueJobId = string | number;

export type QueueConnectionOptions = RedisOptions;

export type QueueAddOptions = JobsOptions;
