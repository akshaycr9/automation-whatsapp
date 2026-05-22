import {
  AutomationActionStateValue,
  AutomationFlowKey,
  AutomationResourceType,
  PrismaClient,
  type Prisma
} from "@prisma/client";

const prisma = new PrismaClient();

export class AutomationActionStateRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findByFlowResource(flowKey: AutomationFlowKey, resourceType: AutomationResourceType, resourceId: string) {
    return this.db.automationActionState.findUnique({
      where: {
        flowKey_resourceType_resourceId: {
          flowKey,
          resourceType,
          resourceId
        }
      }
    });
  }

  upsertState(input: {
    flowKey: AutomationFlowKey;
    resourceType: AutomationResourceType;
    resourceId: string;
    customerPhone?: string | null;
    state: AutomationActionStateValue;
    sourceEventId?: string | null;
  }) {
    const updateData: Prisma.AutomationActionStateUncheckedUpdateInput = {
      customerPhone: input.customerPhone ?? null,
      state: input.state,
      sourceEventId: input.sourceEventId ?? null
    };
    const createData: Prisma.AutomationActionStateUncheckedCreateInput = {
      flowKey: input.flowKey,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      customerPhone: input.customerPhone ?? null,
      state: input.state,
      sourceEventId: input.sourceEventId ?? null
    };

    return this.db.automationActionState.upsert({
      where: {
        flowKey_resourceType_resourceId: {
          flowKey: input.flowKey,
          resourceType: input.resourceType,
          resourceId: input.resourceId
        }
      },
      update: updateData,
      create: createData
    });
  }
}
