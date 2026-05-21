import { Queue, type QueueOptions, type WorkerOptions } from "bullmq";
import { env } from "../../../config/env.js";
import { logger } from "../../../lib/logger.js";
import { AUTOMATION_EVENTS_QUEUE, AUTOMATION_SEND_QUEUE, DEFAULT_JOB_OPTIONS } from "../domain/queue.constants.js";
import type {
  AutomationEventJobPayload,
  AutomationSendJobPayload,
  QueueConnectionOptions
} from "../domain/queue.types.js";

type QueueRegistry = {
  automationEventsQueue: Queue<AutomationEventJobPayload> | undefined;
  automationSendQueue: Queue<AutomationSendJobPayload> | undefined;
};

const queues: QueueRegistry = {
  automationEventsQueue: undefined,
  automationSendQueue: undefined
};

export function getRedisConnectionOptions(): QueueConnectionOptions {
  if (env.REDIS_URL) {
    logger.info({ event: "redis.configured", mode: "url" });
    return {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null
    };
  }

  logger.info({
    event: "redis.configured",
    mode: "host",
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: env.REDIS_DB
  });

  return {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    db: env.REDIS_DB,
    maxRetriesPerRequest: null
  };
}

export function getQueueOptions(): QueueOptions {
  return {
    connection: getRedisConnectionOptions(),
    defaultJobOptions: DEFAULT_JOB_OPTIONS
  };
}

export function getWorkerOptions(): WorkerOptions {
  return {
    connection: getRedisConnectionOptions()
  };
}

export function getAutomationEventsQueue() {
  if (!queues.automationEventsQueue) {
    queues.automationEventsQueue = new Queue<AutomationEventJobPayload>(AUTOMATION_EVENTS_QUEUE, getQueueOptions());
    logger.info({ event: "queue.initialized", queue: AUTOMATION_EVENTS_QUEUE });
  }

  return queues.automationEventsQueue;
}

export function getAutomationSendQueue() {
  if (!queues.automationSendQueue) {
    queues.automationSendQueue = new Queue<AutomationSendJobPayload>(AUTOMATION_SEND_QUEUE, getQueueOptions());
    logger.info({ event: "queue.initialized", queue: AUTOMATION_SEND_QUEUE });
  }

  return queues.automationSendQueue;
}

export async function closeQueues() {
  await Promise.all([queues.automationEventsQueue?.close(), queues.automationSendQueue?.close()]);
  queues.automationEventsQueue = undefined;
  queues.automationSendQueue = undefined;
}
