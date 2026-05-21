-- CreateEnum
CREATE TYPE "AutomationFlowKey" AS ENUM ('ORDER_FLOW', 'COD_FLOW', 'ABANDONED_CART_FLOW');

-- CreateEnum
CREATE TYPE "AutomationKey" AS ENUM ('ORDER_CONFIRMED', 'ORDER_FULFILLED', 'ORDER_CANCELLED', 'COD_ORDER_CONFIRMATION', 'COD_ORDER_CONFIRMED', 'COD_ORDER_CANCELLED', 'COD_ORDER_FOLLOW_UP', 'ABANDONED_CART_1', 'ABANDONED_CART_2', 'ABANDONED_CART_3');

-- CreateEnum
CREATE TYPE "AutomationTriggerSource" AS ENUM ('SHOPIFY', 'WHATSAPP', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AutomationTriggerEvent" AS ENUM ('ORDER_CREATED', 'ORDER_FULFILLED', 'ORDER_CANCELLED', 'COD_ORDER_CREATED', 'CHECKOUT_ABANDONED', 'BUTTON_REPLY');

-- CreateEnum
CREATE TYPE "AutomationResourceType" AS ENUM ('ORDER', 'CHECKOUT', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "AutomationJobStatus" AS ENUM ('PENDING', 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AutomationComponentType" AS ENUM ('HEADER', 'BODY', 'BUTTON');

-- CreateEnum
CREATE TYPE "AutomationActionStateValue" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED', 'FOLLOW_UP_SENT', 'ABANDONED_ACTIVE', 'RECOVERED', 'EXPIRED');

-- CreateTable
CREATE TABLE "AutomationFlow" (
    "id" TEXT NOT NULL,
    "key" "AutomationFlowKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Automation" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "key" "AutomationKey" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "triggerSource" "AutomationTriggerSource" NOT NULL,
    "triggerEvent" "AutomationTriggerEvent" NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "templateId" TEXT,
    "delayMinutes" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Automation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationVariableMapping" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "templateVariableName" TEXT NOT NULL,
    "componentType" "AutomationComponentType" NOT NULL,
    "variableIndex" INTEGER NOT NULL,
    "sourceField" TEXT NOT NULL,
    "fallbackValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationVariableMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationButtonAction" (
    "id" TEXT NOT NULL,
    "sourceAutomationId" TEXT NOT NULL,
    "targetAutomationId" TEXT NOT NULL,
    "actionKey" TEXT NOT NULL,
    "buttonText" TEXT NOT NULL,
    "payloadPrefix" TEXT NOT NULL,
    "resourceType" "AutomationResourceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationButtonAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncomingEvent" (
    "id" TEXT NOT NULL,
    "source" "AutomationTriggerSource" NOT NULL,
    "eventType" "AutomationTriggerEvent" NOT NULL,
    "externalEventId" TEXT,
    "resourceType" "AutomationResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "customerPhone" TEXT,
    "payloadJson" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncomingEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationJob" (
    "id" TEXT NOT NULL,
    "automationId" TEXT NOT NULL,
    "incomingEventId" TEXT NOT NULL,
    "resourceType" "AutomationResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "customerPhone" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" "AutomationJobStatus" NOT NULL DEFAULT 'PENDING',
    "bullmqJobId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationActionState" (
    "id" TEXT NOT NULL,
    "flowKey" "AutomationFlowKey" NOT NULL,
    "resourceType" "AutomationResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "customerPhone" TEXT,
    "state" "AutomationActionStateValue" NOT NULL,
    "sourceEventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationActionState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutomationFlow_key_key" ON "AutomationFlow"("key");

-- CreateIndex
CREATE INDEX "AutomationFlow_sortOrder_idx" ON "AutomationFlow"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Automation_key_key" ON "Automation"("key");

-- CreateIndex
CREATE INDEX "Automation_flowId_sortOrder_idx" ON "Automation"("flowId", "sortOrder");

-- CreateIndex
CREATE INDEX "Automation_triggerSource_triggerEvent_idx" ON "Automation"("triggerSource", "triggerEvent");

-- CreateIndex
CREATE INDEX "Automation_isEnabled_idx" ON "Automation"("isEnabled");

-- CreateIndex
CREATE INDEX "Automation_templateId_idx" ON "Automation"("templateId");

-- CreateIndex
CREATE INDEX "AutomationVariableMapping_automationId_idx" ON "AutomationVariableMapping"("automationId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationVariableMapping_automationId_componentType_variable_key" ON "AutomationVariableMapping"("automationId", "componentType", "variableIndex");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationButtonAction_payloadPrefix_key" ON "AutomationButtonAction"("payloadPrefix");

-- CreateIndex
CREATE INDEX "AutomationButtonAction_sourceAutomationId_idx" ON "AutomationButtonAction"("sourceAutomationId");

-- CreateIndex
CREATE INDEX "AutomationButtonAction_targetAutomationId_idx" ON "AutomationButtonAction"("targetAutomationId");

-- CreateIndex
CREATE INDEX "AutomationButtonAction_actionKey_idx" ON "AutomationButtonAction"("actionKey");

-- CreateIndex
CREATE INDEX "AutomationButtonAction_isActive_idx" ON "AutomationButtonAction"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "IncomingEvent_source_externalEventId_key" ON "IncomingEvent"("source", "externalEventId");

-- CreateIndex
CREATE INDEX "IncomingEvent_source_eventType_idx" ON "IncomingEvent"("source", "eventType");

-- CreateIndex
CREATE INDEX "IncomingEvent_resourceType_resourceId_idx" ON "IncomingEvent"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "IncomingEvent_customerPhone_idx" ON "IncomingEvent"("customerPhone");

-- CreateIndex
CREATE INDEX "IncomingEvent_isProcessed_idx" ON "IncomingEvent"("isProcessed");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationJob_idempotencyKey_key" ON "AutomationJob"("idempotencyKey");

-- CreateIndex
CREATE INDEX "AutomationJob_automationId_idx" ON "AutomationJob"("automationId");

-- CreateIndex
CREATE INDEX "AutomationJob_incomingEventId_idx" ON "AutomationJob"("incomingEventId");

-- CreateIndex
CREATE INDEX "AutomationJob_resourceType_resourceId_idx" ON "AutomationJob"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AutomationJob_status_idx" ON "AutomationJob"("status");

-- CreateIndex
CREATE INDEX "AutomationJob_scheduledAt_idx" ON "AutomationJob"("scheduledAt");

-- CreateIndex
CREATE INDEX "AutomationJob_bullmqJobId_idx" ON "AutomationJob"("bullmqJobId");

-- CreateIndex
CREATE UNIQUE INDEX "AutomationActionState_flowKey_resourceType_resourceId_key" ON "AutomationActionState"("flowKey", "resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AutomationActionState_state_idx" ON "AutomationActionState"("state");

-- CreateIndex
CREATE INDEX "AutomationActionState_customerPhone_idx" ON "AutomationActionState"("customerPhone");

-- CreateIndex
CREATE INDEX "AutomationActionState_sourceEventId_idx" ON "AutomationActionState"("sourceEventId");

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "AutomationFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Automation" ADD CONSTRAINT "Automation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WhatsAppTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationVariableMapping" ADD CONSTRAINT "AutomationVariableMapping_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationButtonAction" ADD CONSTRAINT "AutomationButtonAction_sourceAutomationId_fkey" FOREIGN KEY ("sourceAutomationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationButtonAction" ADD CONSTRAINT "AutomationButtonAction_targetAutomationId_fkey" FOREIGN KEY ("targetAutomationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationJob" ADD CONSTRAINT "AutomationJob_automationId_fkey" FOREIGN KEY ("automationId") REFERENCES "Automation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationJob" ADD CONSTRAINT "AutomationJob_incomingEventId_fkey" FOREIGN KEY ("incomingEventId") REFERENCES "IncomingEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationActionState" ADD CONSTRAINT "AutomationActionState_sourceEventId_fkey" FOREIGN KEY ("sourceEventId") REFERENCES "IncomingEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
