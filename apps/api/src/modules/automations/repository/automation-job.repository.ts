import { AutomationJobStatus, AutomationKey, AutomationResourceType, PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class AutomationJobRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  create(data: Prisma.AutomationJobUncheckedCreateInput) {
    return this.db.automationJob.create({ data });
  }

  findByIdempotencyKey(idempotencyKey: string) {
    return this.db.automationJob.findUnique({ where: { idempotencyKey } });
  }

  findByIdWithRelations(id: string) {
    return this.db.automationJob.findUnique({
      where: { id },
      include: {
        incomingEvent: true,
        automation: {
          include: {
            template: {
              include: {
                components: true,
                variables: true,
                buttons: true
              }
            },
            variableMappings: true
          }
        }
      }
    });
  }

  markProcessing(id: string) {
    return this.db.automationJob.update({
      where: { id },
      data: {
        status: AutomationJobStatus.PROCESSING,
        attemptCount: { increment: 1 },
        lastError: null
      }
    });
  }

  markCompleted(id: string) {
    return this.db.automationJob.update({
      where: { id },
      data: {
        status: AutomationJobStatus.COMPLETED,
        lastError: null
      }
    });
  }

  markSkipped(id: string, reason: string) {
    return this.db.automationJob.update({
      where: { id },
      data: {
        status: AutomationJobStatus.SKIPPED,
        lastError: reason
      }
    });
  }

  updateQueued(id: string, bullmqJobId: string) {
    return this.db.automationJob.update({
      where: { id },
      data: {
        bullmqJobId,
        status: AutomationJobStatus.QUEUED,
        lastError: null
      }
    });
  }

  updateFailed(id: string, lastError: string) {
    return this.db.automationJob.update({
      where: { id },
      data: {
        status: AutomationJobStatus.FAILED,
        lastError
      }
    });
  }

  cancelPendingJobsForAutomationKeyAndResource(input: {
    automationKey: AutomationKey;
    resourceType: AutomationResourceType;
    resourceId: string;
  }) {
    return this.db.automationJob.findMany({
      where: {
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        status: { in: [AutomationJobStatus.PENDING, AutomationJobStatus.QUEUED] },
        automation: { key: input.automationKey }
      }
    });
  }

  markCancelled(id: string) {
    return this.db.automationJob.update({
      where: { id },
      data: { status: AutomationJobStatus.CANCELLED }
    });
  }
}
