import { Worker, type Job } from "bullmq";
import { logger } from "../../../lib/logger.js";
import { AUTOMATION_SEND_QUEUE } from "../domain/queue.constants.js";
import type { AutomationSendJobPayload } from "../domain/queue.types.js";
import { getWorkerOptions } from "../providers/queue.provider.js";

export function createAutomationSendWorker() {
  return new Worker<AutomationSendJobPayload>(
    AUTOMATION_SEND_QUEUE,
    async (job: Job<AutomationSendJobPayload>) => {
      logger.info({
        event: "automation_send_job.received",
        jobId: job.id,
        automationJobId: job.data.automationJobId
      });

      return { ok: true };
    },
    getWorkerOptions()
  );
}
