import type { Worker } from "bullmq";
import { env } from "../../../config/env.js";
import { logger } from "../../../lib/logger.js";
import { createAutomationEventWorker } from "./automation-event.worker.js";
import { createAutomationSendWorker } from "./automation-send.worker.js";

let workers: Worker[] = [];
let shutdownRegistered = false;

type StartQueueWorkersOptions = {
  registerShutdownHooks?: boolean;
};

export function startQueueWorkers(options: StartQueueWorkersOptions = {}) {
  if (env.NODE_ENV === "test" || !env.ENABLE_QUEUE_WORKERS) {
    logger.info({ event: "queue_workers.skipped", nodeEnv: env.NODE_ENV, enabled: env.ENABLE_QUEUE_WORKERS });
    return [];
  }

  if (workers.length > 0) {
    return workers;
  }

  workers = [createAutomationEventWorker(), createAutomationSendWorker()];
  workers.forEach(attachWorkerLogs);

  if (options.registerShutdownHooks ?? true) {
    registerShutdownHooks();
  }

  logger.info({ event: "queue_workers.started", count: workers.length });
  return workers;
}

export async function stopQueueWorkers() {
  await Promise.all(workers.map((worker) => worker.close()));
  workers = [];
  logger.info({ event: "queue_workers.stopped" });
}

function attachWorkerLogs(worker: Worker) {
  worker.on("completed", (job) => {
    logger.info({ event: "queue_job.completed", queue: worker.name, jobId: job.id });
  });

  worker.on("failed", (job, error) => {
    logger.error({ event: "queue_job.failed", queue: worker.name, jobId: job?.id, error });
  });

  worker.on("error", (error) => {
    logger.error({ event: "queue_worker.error", queue: worker.name, error });
  });

  logger.info({ event: "queue_worker.started", queue: worker.name });
}

function registerShutdownHooks() {
  if (shutdownRegistered) {
    return;
  }

  shutdownRegistered = true;

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.once(signal, () => {
      void stopQueueWorkers().finally(() => {
        process.exit(0);
      });
    });
  }
}
