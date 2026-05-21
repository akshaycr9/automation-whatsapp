import { Worker, type Job } from "bullmq";
import { logger } from "../../../lib/logger.js";
import { AUTOMATION_EVENTS_QUEUE } from "../domain/queue.constants.js";
import type { AutomationEventJobPayload } from "../domain/queue.types.js";
import { getWorkerOptions } from "../providers/queue.provider.js";

export function createAutomationEventWorker() {
  return new Worker<AutomationEventJobPayload>(
    AUTOMATION_EVENTS_QUEUE,
    async (job: Job<AutomationEventJobPayload>) => {
      logger.info({
        event: "automation_event_job.received",
        jobId: job.id,
        incomingEventId: job.data.incomingEventId
      });

      return { ok: true };
    },
    getWorkerOptions()
  );
}
