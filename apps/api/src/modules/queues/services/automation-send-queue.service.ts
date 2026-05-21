import { AUTOMATION_SEND_JOB } from "../domain/queue.constants.js";
import type { AddAutomationSendJobInput, QueueJobId } from "../domain/queue.types.js";
import { getAutomationSendQueue } from "../providers/queue.provider.js";

export class AutomationSendQueueService {
  async addSendJob(input: AddAutomationSendJobInput): Promise<QueueJobId> {
    const queue = getAutomationSendQueue();
    const job = await queue.add(
      AUTOMATION_SEND_JOB,
      { automationJobId: input.automationJobId },
      {
        ...(input.idempotencyKey ? { jobId: input.idempotencyKey } : {}),
        ...(input.delayMs && input.delayMs > 0 ? { delay: input.delayMs } : {})
      }
    );

    if (!job.id) {
      throw new Error("BullMQ did not return an automation send job id.");
    }

    return job.id;
  }

  async removeJob(jobId: string): Promise<void> {
    const queue = getAutomationSendQueue();
    const job = await queue.getJob(jobId);
    await job?.remove();
  }
}
