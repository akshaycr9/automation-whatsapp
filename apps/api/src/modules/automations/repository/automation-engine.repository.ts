import {
  AutomationKey,
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource,
  PrismaClient
} from "@prisma/client";

const prisma = new PrismaClient();

const automationInclude = {
  flow: true,
  template: true
};

export type EngineAutomation = NonNullable<Awaited<ReturnType<AutomationEngineRepository["findById"]>>>;
export type EngineButtonAction = NonNullable<
  Awaited<ReturnType<AutomationEngineRepository["findButtonTargetAutomation"]>>
>;

export class AutomationEngineRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findEnabledByTrigger(source: AutomationTriggerSource, eventType: AutomationTriggerEvent) {
    return this.db.automation.findMany({
      where: {
        triggerSource: source,
        triggerEvent: eventType,
        isEnabled: true
      },
      include: automationInclude,
      orderBy: { sortOrder: "asc" }
    });
  }

  findById(id: string) {
    return this.db.automation.findUnique({
      where: { id },
      include: automationInclude
    });
  }

  findByKey(key: AutomationKey) {
    return this.db.automation.findUnique({
      where: { key },
      include: automationInclude
    });
  }

  findButtonTargetAutomation(input: { actionKey: string; resourceType: AutomationResourceType; payload?: string }) {
    return this.db.automationButtonAction.findFirst({
      where: {
        actionKey: input.actionKey,
        resourceType: input.resourceType,
        isActive: true
      },
      include: {
        targetAutomation: {
          include: automationInclude
        }
      },
      orderBy: { createdAt: "asc" }
    });
  }
}
