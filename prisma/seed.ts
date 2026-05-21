import "dotenv/config";
import {
  AutomationFlowKey,
  AutomationKey,
  AutomationResourceType,
  AutomationTriggerEvent,
  AutomationTriggerSource,
  PrismaClient
} from "@prisma/client";
import { z } from "zod";
import { PasswordService } from "../apps/api/src/modules/auth/password.service.js";

type AdminUserSeedStore = {
  adminUser: {
    count(): Promise<number>;
    findUnique(args: { where: { email: string } }): Promise<{ id: string } | null>;
    create(args: { data: { email: string; passwordHash: string; isActive: boolean } }): Promise<{ id: string }>;
    update(args: {
      where: { email: string };
      data: { passwordHash: string; isActive: boolean; failedLoginCount: number; lockedUntil: null };
    }): Promise<{ id: string }>;
  };
};

const automationFlows = [
  {
    key: AutomationFlowKey.ORDER_FLOW,
    name: "Order Flow",
    description: "Automations related to normal order lifecycle events.",
    sortOrder: 1
  },
  {
    key: AutomationFlowKey.COD_FLOW,
    name: "Cash on Delivery Flow",
    description: "Automations related to COD order confirmation and follow-up.",
    sortOrder: 2
  },
  {
    key: AutomationFlowKey.ABANDONED_CART_FLOW,
    name: "Abandoned Cart Flow",
    description: "Automations related to abandoned checkout recovery.",
    sortOrder: 3
  }
] as const;

const automations = [
  {
    flowKey: AutomationFlowKey.ORDER_FLOW,
    key: AutomationKey.ORDER_CONFIRMED,
    name: "Order Confirmed",
    description: "Sent when a prepaid or confirmed order is created.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.ORDER_CREATED,
    delayMinutes: 0,
    sortOrder: 1
  },
  {
    flowKey: AutomationFlowKey.ORDER_FLOW,
    key: AutomationKey.ORDER_FULFILLED,
    name: "Order Fulfilled",
    description: "Sent when an order is fulfilled.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.ORDER_FULFILLED,
    delayMinutes: 0,
    sortOrder: 2
  },
  {
    flowKey: AutomationFlowKey.ORDER_FLOW,
    key: AutomationKey.ORDER_CANCELLED,
    name: "Order Cancelled",
    description: "Sent when an order is cancelled.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.ORDER_CANCELLED,
    delayMinutes: 0,
    sortOrder: 3
  },
  {
    flowKey: AutomationFlowKey.COD_FLOW,
    key: AutomationKey.COD_ORDER_CONFIRMATION,
    name: "COD Order Confirmation",
    description:
      "Sent immediately when a customer places a cash on delivery order and asks the customer to confirm or cancel the order.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.COD_ORDER_CREATED,
    delayMinutes: 0,
    sortOrder: 1
  },
  {
    flowKey: AutomationFlowKey.COD_FLOW,
    key: AutomationKey.COD_ORDER_CONFIRMED,
    name: "COD Order Confirmed",
    description: "Sent when the customer confirms their COD order from WhatsApp.",
    triggerSource: AutomationTriggerSource.WHATSAPP,
    triggerEvent: AutomationTriggerEvent.BUTTON_REPLY,
    delayMinutes: 0,
    sortOrder: 2
  },
  {
    flowKey: AutomationFlowKey.COD_FLOW,
    key: AutomationKey.COD_ORDER_CANCELLED,
    name: "COD Order Cancelled",
    description: "Sent when the customer cancels their COD order from WhatsApp.",
    triggerSource: AutomationTriggerSource.WHATSAPP,
    triggerEvent: AutomationTriggerEvent.BUTTON_REPLY,
    delayMinutes: 0,
    sortOrder: 3
  },
  {
    flowKey: AutomationFlowKey.COD_FLOW,
    key: AutomationKey.COD_ORDER_FOLLOW_UP,
    name: "COD Order Follow-up",
    description: "Sent after a configurable delay if the customer has not confirmed or cancelled their COD order.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.COD_ORDER_CREATED,
    delayMinutes: 240,
    sortOrder: 4
  },
  {
    flowKey: AutomationFlowKey.ABANDONED_CART_FLOW,
    key: AutomationKey.ABANDONED_CART_1,
    name: "Abandoned Cart 1",
    description: "First abandoned cart recovery message.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.CHECKOUT_ABANDONED,
    delayMinutes: 30,
    sortOrder: 1
  },
  {
    flowKey: AutomationFlowKey.ABANDONED_CART_FLOW,
    key: AutomationKey.ABANDONED_CART_2,
    name: "Abandoned Cart 2",
    description: "Second abandoned cart recovery message.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.CHECKOUT_ABANDONED,
    delayMinutes: 360,
    sortOrder: 2
  },
  {
    flowKey: AutomationFlowKey.ABANDONED_CART_FLOW,
    key: AutomationKey.ABANDONED_CART_3,
    name: "Abandoned Cart 3",
    description: "Third abandoned cart recovery message.",
    triggerSource: AutomationTriggerSource.SHOPIFY,
    triggerEvent: AutomationTriggerEvent.CHECKOUT_ABANDONED,
    delayMinutes: 720,
    sortOrder: 3
  }
] as const;

const codButtonActions = [
  {
    sourceAutomationKey: AutomationKey.COD_ORDER_CONFIRMATION,
    targetAutomationKey: AutomationKey.COD_ORDER_CONFIRMED,
    actionKey: "COD_CONFIRM",
    buttonText: "Confirm my order",
    payloadPrefix: "COD_CONFIRM:ORDER",
    resourceType: AutomationResourceType.ORDER,
    isActive: true
  },
  {
    sourceAutomationKey: AutomationKey.COD_ORDER_CONFIRMATION,
    targetAutomationKey: AutomationKey.COD_ORDER_CANCELLED,
    actionKey: "COD_CANCEL",
    buttonText: "Cancel my order",
    payloadPrefix: "COD_CANCEL:ORDER",
    resourceType: AutomationResourceType.ORDER,
    isActive: true
  }
] as const;

const seedEnvSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(1)
});

const prisma = new PrismaClient();

async function main() {
  await seedAdminUser(prisma as unknown as AdminUserSeedStore);
  await seedAutomations();
}

async function seedAdminUser(adminStore: AdminUserSeedStore) {
  const seedEnv = seedEnvSchema.safeParse(process.env);

  if (!seedEnv.success) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required to seed the admin user.");
  }

  const email = seedEnv.data.ADMIN_EMAIL.toLowerCase();
  const passwordService = new PasswordService();
  const passwordHash = await passwordService.hashPassword(seedEnv.data.ADMIN_PASSWORD);
  const existingAdmin = await adminStore.adminUser.findUnique({ where: { email } });

  if (existingAdmin) {
    await adminStore.adminUser.update({
      where: { email },
      data: {
        passwordHash,
        isActive: true,
        failedLoginCount: 0,
        lockedUntil: null
      }
    });
    console.log(`Admin user updated: ${email}`);
    return;
  }

  const adminCount = await adminStore.adminUser.count();

  if (adminCount > 0) {
    throw new Error("An admin user already exists. Refusing to create a second admin for the single-admin MVP.");
  }

  await adminStore.adminUser.create({
    data: {
      email,
      passwordHash,
      isActive: true
    }
  });

  console.log(`Admin user created: ${email}`);
}

async function seedAutomations() {
  const flowIdsByKey = new Map<AutomationFlowKey, string>();
  const automationIdsByKey = new Map<AutomationKey, string>();

  for (const flow of automationFlows) {
    const upsertedFlow = await prisma.automationFlow.upsert({
      where: { key: flow.key },
      update: {
        name: flow.name,
        description: flow.description,
        sortOrder: flow.sortOrder
      },
      create: flow
    });

    flowIdsByKey.set(flow.key, upsertedFlow.id);
  }

  for (const automation of automations) {
    const flowId = flowIdsByKey.get(automation.flowKey);

    if (!flowId) {
      throw new Error(`Missing automation flow for ${automation.flowKey}.`);
    }

    const upsertedAutomation = await prisma.automation.upsert({
      where: { key: automation.key },
      update: {
        flowId,
        name: automation.name,
        description: automation.description,
        triggerSource: automation.triggerSource,
        triggerEvent: automation.triggerEvent,
        delayMinutes: automation.delayMinutes,
        sortOrder: automation.sortOrder
      },
      create: {
        flowId,
        key: automation.key,
        name: automation.name,
        description: automation.description,
        triggerSource: automation.triggerSource,
        triggerEvent: automation.triggerEvent,
        isEnabled: false,
        templateId: null,
        delayMinutes: automation.delayMinutes,
        sortOrder: automation.sortOrder
      }
    });

    automationIdsByKey.set(automation.key, upsertedAutomation.id);
  }

  for (const buttonAction of codButtonActions) {
    const sourceAutomationId = automationIdsByKey.get(buttonAction.sourceAutomationKey);
    const targetAutomationId = automationIdsByKey.get(buttonAction.targetAutomationKey);

    if (!sourceAutomationId || !targetAutomationId) {
      throw new Error(`Missing COD button action automation relation for ${buttonAction.actionKey}.`);
    }

    await prisma.automationButtonAction.upsert({
      where: { payloadPrefix: buttonAction.payloadPrefix },
      update: {
        sourceAutomationId,
        targetAutomationId,
        actionKey: buttonAction.actionKey,
        buttonText: buttonAction.buttonText,
        resourceType: buttonAction.resourceType,
        isActive: buttonAction.isActive
      },
      create: {
        sourceAutomationId,
        targetAutomationId,
        actionKey: buttonAction.actionKey,
        buttonText: buttonAction.buttonText,
        payloadPrefix: buttonAction.payloadPrefix,
        resourceType: buttonAction.resourceType,
        isActive: buttonAction.isActive
      }
    });
  }

  console.log(`Automation flows seeded: ${automationFlows.length}`);
  console.log(`Automations seeded: ${automations.length}`);
  console.log(`Automation button actions seeded: ${codButtonActions.length}`);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
