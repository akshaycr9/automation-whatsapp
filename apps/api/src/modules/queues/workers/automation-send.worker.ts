import { Worker, type Job } from "bullmq";
import { logger } from "../../../lib/logger.js";
import { AutomationSendProcessorService } from "../../automations/services/automation-send-processor.service.js";
import { AUTOMATION_SEND_QUEUE } from "../domain/queue.constants.js";
import type { AutomationSendJobPayload } from "../domain/queue.types.js";
import { getWorkerOptions } from "../providers/queue.provider.js";

export function createAutomationSendWorker() {
  const processor = new AutomationSendProcessorService();

  return new Worker<AutomationSendJobPayload>(
    AUTOMATION_SEND_QUEUE,
    async (job: Job<AutomationSendJobPayload>) => {
      logger.info({
        event: "automation_send_job.received",
        jobId: job.id,
        automationJobId: job.data.automationJobId
      });

      const result = await processor.processAutomationJob(job.data.automationJobId);

      logger.info({
        event: "automation_send_job.processed",
        jobId: job.id,
        automationJobId: job.data.automationJobId,
        result
      });

      return result;
    },
    getWorkerOptions()
  );
}
