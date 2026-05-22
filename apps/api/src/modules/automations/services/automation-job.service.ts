import { AutomationJobStatus, type IncomingEvent } from "@prisma/client";
import { logger } from "../../../lib/logger.js";
import { AutomationSendQueueService } from "../../queues/services/automation-send-queue.service.js";
import type { InternalAutomationEvent } from "../domain/internal-automation-event.js";
import { AutomationJobRepository } from "../repository/automation-job.repository.js";
import type { EngineAutomation } from "../repository/automation-engine.repository.js";

export class AutomationJobService {
  constructor(
    private readonly repository = new AutomationJobRepository(),
    private readonly queue = new AutomationSendQueueService()
  ) {}

  async createAutomationJobAndEnqueue(input: {
    automation: EngineAutomation;
    incomingEvent: IncomingEvent;
    event: InternalAutomationEvent;
    scheduledAt: Date;
    idempotencyKey: string;
  }) {
    const existing = await this.repository.findByIdempotencyKey(input.idempotencyKey);
    if (existing) {
      logger.info({
        event: "automation_job.duplicate",
        automationJobId: existing.id,
        idempotencyKey: input.idempotencyKey
      });
      return existing;
    }

    const automationJob = await this.repository.create({
      automationId: input.automation.id,
      incomingEventId: input.incomingEvent.id,
      resourceType: input.event.resourceType,
      resourceId: input.event.resourceId ?? input.incomingEvent.resourceId,
      customerPhone: input.event.customerPhone ?? null,
      scheduledAt: input.scheduledAt,
      status: AutomationJobStatus.PENDING,
      idempotencyKey: input.idempotencyKey
    });

    try {
      const delayMs = Math.max(0, input.scheduledAt.getTime() - Date.now());
      const bullmqJobId = await this.queue.addSendJob({
        automationJobId: automationJob.id,
        idempotencyKey: input.idempotencyKey,
        ...(delayMs > 0 ? { delayMs } : {})
      });

      return this.repository.updateQueued(automationJob.id, String(bullmqJobId));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to enqueue automation send job.";
      await this.repository.updateFailed(automationJob.id, message);
      throw error;
    }
  }

  async cancelPendingJobsForAutomationKeyAndResource(
    input: Parameters<AutomationJobRepository["cancelPendingJobsForAutomationKeyAndResource"]>[0]
  ) {
    const jobs = await this.repository.cancelPendingJobsForAutomationKeyAndResource(input);

    for (const job of jobs) {
      if (job.bullmqJobId) {
        try {
          await this.queue.removeJob(job.bullmqJobId);
        } catch (error) {
          logger.error({
            event: "automation_job.remove_queued_job_failed",
            automationJobId: job.id,
            bullmqJobId: job.bullmqJobId,
            error: error instanceof Error ? error.message : "Unknown error"
          });
        }
      }

      await this.repository.markCancelled(job.id);
    }

    return jobs.length;
  }
}
