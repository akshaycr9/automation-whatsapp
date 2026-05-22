import { AutomationTriggerSource, PrismaClient, type Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export class IncomingEventRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  createIncomingEvent(data: Prisma.IncomingEventCreateInput) {
    return this.db.incomingEvent.create({ data });
  }

  findBySourceAndExternalEventId(source: AutomationTriggerSource, externalEventId: string) {
    return this.db.incomingEvent.findUnique({
      where: {
        source_externalEventId: {
          source,
          externalEventId
        }
      }
    });
  }

  findById(id: string) {
    return this.db.incomingEvent.findUnique({ where: { id } });
  }

  markProcessed(id: string) {
    return this.db.incomingEvent.update({
      where: { id },
      data: {
        isProcessed: true,
        processedAt: new Date(),
        errorMessage: null
      }
    });
  }

  markFailed(id: string, errorMessage: string) {
    return this.db.incomingEvent.update({
      where: { id },
      data: { errorMessage }
    });
  }

  updateErrorMessage(id: string, errorMessage: string | null) {
    return this.db.incomingEvent.update({
      where: { id },
      data: { errorMessage }
    });
  }
}
