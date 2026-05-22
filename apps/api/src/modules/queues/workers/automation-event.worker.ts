import { Worker, type Job } from "bullmq";
import { logger } from "../../../lib/logger.js";
import { AutomationEventProcessorService } from "../../automations/services/automation-event-processor.service.js";
import { AUTOMATION_EVENTS_QUEUE } from "../domain/queue.constants.js";
import type { AutomationEventJobPayload } from "../domain/queue.types.js";
import { getWorkerOptions } from "../providers/queue.provider.js";

export function createAutomationEventWorker() {
  const processor = new AutomationEventProcessorService();

  return new Worker<AutomationEventJobPayload>(
    AUTOMATION_EVENTS_QUEUE,
    async (job: Job<AutomationEventJobPayload>) => {
      logger.info({
        event: "automation_event_job.received",
        jobId: job.id,
        incomingEventId: job.data.incomingEventId
      });

      const result = await processor.processIncomingEvent(job.data.incomingEventId);

      logger.info({
        event: "automation_event_job.processed",
        jobId: job.id,
        incomingEventId: job.data.incomingEventId,
        result
      });

      return result;
    },
    getWorkerOptions()
  );
}
