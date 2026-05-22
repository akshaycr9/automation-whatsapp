import { PrismaClient, type Prisma } from "@prisma/client";
import type { UpdateAutomationInput } from "./domain/automation.types.js";

type AutomationDbClient = PrismaClient | Prisma.TransactionClient;

const prisma = new PrismaClient();

const automationInclude = {
  flow: true,
  template: {
    include: {
      components: true,
      variables: true
    }
  },
  variableMappings: true,
  targetButtonActions: true
} satisfies Prisma.AutomationInclude;

export class AutomationsRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findFlowsWithAutomations() {
    return this.db.automationFlow.findMany({
      include: {
        automations: {
          include: automationInclude,
          orderBy: { sortOrder: "asc" }
        }
      },
      orderBy: { sortOrder: "asc" }
    });
  }

  findAutomationById(id: string, client: AutomationDbClient = this.db) {
    return client.automation.findUnique({
      where: { id },
      include: automationInclude
    });
  }

  findTemplateById(id: string, adminUserId: string, client: AutomationDbClient = this.db) {
    return client.whatsAppTemplate.findFirst({
      where: {
        id,
        adminUserId,
        deletedAt: null
      },
      include: {
        components: true,
        variables: true
      }
    });
  }

  async updateAutomationConfig(id: string, input: UpdateAutomationInput, client: AutomationDbClient) {
    await client.automation.update({
      where: { id },
      data: {
        templateId: input.templateId,
        delayMinutes: input.delayMinutes
      }
    });

    await this.replaceVariableMappings(id, input.variableMappings, client);

    return this.findAutomationById(id, client);
  }

  async replaceVariableMappings(
    automationId: string,
    mappings: UpdateAutomationInput["variableMappings"],
    client: AutomationDbClient
  ) {
    await client.automationVariableMapping.deleteMany({
      where: { automationId }
    });

    if (mappings.length === 0) return;

    await client.automationVariableMapping.createMany({
      data: mappings.map((mapping) => ({
        automationId,
        templateVariableName: mapping.templateVariableName,
        componentType: mapping.componentType,
        variableIndex: mapping.variableIndex,
        sourceField: mapping.sourceField,
        fallbackValue: mapping.fallbackValue ?? null
      }))
    });
  }

  async updateAutomationEnabled(id: string, isEnabled: boolean) {
    await this.db.automation.update({
      where: { id },
      data: { isEnabled }
    });

    return this.findAutomationById(id);
  }

  transaction<T>(callback: (client: Prisma.TransactionClient) => Promise<T>) {
    return this.db.$transaction(callback);
  }
}
