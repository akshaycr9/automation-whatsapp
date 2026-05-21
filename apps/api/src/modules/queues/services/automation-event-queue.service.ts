import { AUTOMATION_EVENT_JOB } from "../domain/queue.constants.js";
import type { AddAutomationEventJobInput, QueueJobId } from "../domain/queue.types.js";
import { getAutomationEventsQueue } from "../providers/queue.provider.js";

export class AutomationEventQueueService {
  async addEventProcessingJob(input: AddAutomationEventJobInput): Promise<QueueJobId> {
    const queue = getAutomationEventsQueue();
    const job = await queue.add(
      AUTOMATION_EVENT_JOB,
      { incomingEventId: input.incomingEventId },
      input.idempotencyKey ? { jobId: input.idempotencyKey } : undefined
    );

    if (!job.id) {
      throw new Error("BullMQ did not return an automation event job id.");
    }

    return job.id;
  }
}
