-- CreateEnum
CREATE TYPE "TemplateType" AS ENUM ('TEXT', 'MEDIA', 'CAROUSEL', 'AUTHENTICATION');

-- CreateEnum
CREATE TYPE "TemplateCategory" AS ENUM ('UTILITY', 'MARKETING', 'AUTHENTICATION');

-- CreateEnum
CREATE TYPE "TemplateStatus" AS ENUM ('DRAFT', 'SUBMITTING', 'PENDING', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'DELETED', 'ERROR');

-- CreateEnum
CREATE TYPE "TemplateComponentType" AS ENUM ('HEADER', 'BODY', 'FOOTER', 'BUTTONS', 'CAROUSEL');

-- CreateEnum
CREATE TYPE "TemplateHeaderFormat" AS ENUM ('NONE', 'TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION');

-- CreateEnum
CREATE TYPE "TemplateButtonType" AS ENUM ('QUICK_REPLY', 'URL', 'PHONE_NUMBER', 'COPY_CODE', 'FLOW');

-- CreateEnum
CREATE TYPE "TemplateQualityRating" AS ENUM ('GREEN', 'YELLOW', 'RED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TemplateProvider" AS ENUM ('META');

-- CreateEnum
CREATE TYPE "TemplateProviderAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SYNC', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "TemplateEventType" AS ENUM ('CREATED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'PAUSED', 'DISABLED', 'SYNCED', 'DELETED', 'WEBHOOK_RECEIVED', 'ERROR');

-- CreateTable
CREATE TABLE "WhatsAppTemplate" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "wabaId" TEXT,
    "metaTemplateId" TEXT,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "category" "TemplateCategory" NOT NULL,
    "type" "TemplateType" NOT NULL,
    "languageCode" TEXT NOT NULL,
    "status" "TemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "qualityRating" "TemplateQualityRating" NOT NULL DEFAULT 'UNKNOWN',
    "rejectionReason" TEXT,
    "allowCategoryChange" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "WhatsAppTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppTemplateComponent" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "componentType" "TemplateComponentType" NOT NULL,
    "format" "TemplateHeaderFormat",
    "text" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppTemplateComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppTemplateVariable" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "componentId" TEXT,
    "componentType" "TemplateComponentType" NOT NULL,
    "position" INTEGER NOT NULL,
    "placeholder" TEXT NOT NULL,
    "label" TEXT,
    "sampleValue" TEXT NOT NULL,
    "sourceKey" TEXT,
    "fallbackValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppTemplateVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppTemplateButton" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "componentId" TEXT,
    "buttonType" "TemplateButtonType" NOT NULL,
    "text" TEXT NOT NULL,
    "url" TEXT,
    "phoneNumber" TEXT,
    "payload" TEXT,
    "flowId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WhatsAppTemplateButton_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppTemplateProviderPayload" (
    "id" TEXT NOT NULL,
    "templateId" TEXT,
    "provider" "TemplateProvider" NOT NULL DEFAULT 'META',
    "action" "TemplateProviderAction" NOT NULL,
    "requestPayload" JSONB,
    "responsePayload" JSONB,
    "statusCode" INTEGER,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppTemplateProviderPayload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WhatsAppTemplateEvent" (
    "id" TEXT NOT NULL,
    "templateId" TEXT,
    "eventType" "TemplateEventType" NOT NULL,
    "oldStatus" "TemplateStatus",
    "newStatus" "TemplateStatus",
    "message" TEXT,
    "metadata" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WhatsAppTemplateEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppTemplate_adminUserId_name_languageCode_key" ON "WhatsAppTemplate"("adminUserId", "name", "languageCode");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_adminUserId_status_idx" ON "WhatsAppTemplate"("adminUserId", "status");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_adminUserId_category_idx" ON "WhatsAppTemplate"("adminUserId", "category");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_adminUserId_type_idx" ON "WhatsAppTemplate"("adminUserId", "type");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_adminUserId_languageCode_idx" ON "WhatsAppTemplate"("adminUserId", "languageCode");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_metaTemplateId_idx" ON "WhatsAppTemplate"("metaTemplateId");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_wabaId_idx" ON "WhatsAppTemplate"("wabaId");

-- CreateIndex
CREATE INDEX "WhatsAppTemplate_deletedAt_idx" ON "WhatsAppTemplate"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppTemplateComponent_templateId_componentType_sortOrde_key" ON "WhatsAppTemplateComponent"("templateId", "componentType", "sortOrder");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateComponent_templateId_idx" ON "WhatsAppTemplateComponent"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppTemplateVariable_templateId_componentType_position_key" ON "WhatsAppTemplateVariable"("templateId", "componentType", "position");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateVariable_templateId_idx" ON "WhatsAppTemplateVariable"("templateId");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateVariable_componentId_idx" ON "WhatsAppTemplateVariable"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppTemplateButton_templateId_sortOrder_key" ON "WhatsAppTemplateButton"("templateId", "sortOrder");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateButton_templateId_idx" ON "WhatsAppTemplateButton"("templateId");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateButton_componentId_idx" ON "WhatsAppTemplateButton"("componentId");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateProviderPayload_templateId_idx" ON "WhatsAppTemplateProviderPayload"("templateId");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateProviderPayload_provider_action_idx" ON "WhatsAppTemplateProviderPayload"("provider", "action");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateProviderPayload_createdAt_idx" ON "WhatsAppTemplateProviderPayload"("createdAt");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateEvent_templateId_idx" ON "WhatsAppTemplateEvent"("templateId");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateEvent_eventType_idx" ON "WhatsAppTemplateEvent"("eventType");

-- CreateIndex
CREATE INDEX "WhatsAppTemplateEvent_createdAt_idx" ON "WhatsAppTemplateEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "WhatsAppTemplate" ADD CONSTRAINT "WhatsAppTemplate_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplate" ADD CONSTRAINT "WhatsAppTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplate" ADD CONSTRAINT "WhatsAppTemplate_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplateComponent" ADD CONSTRAINT "WhatsAppTemplateComponent_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WhatsAppTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplateVariable" ADD CONSTRAINT "WhatsAppTemplateVariable_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WhatsAppTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplateVariable" ADD CONSTRAINT "WhatsAppTemplateVariable_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "WhatsAppTemplateComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplateButton" ADD CONSTRAINT "WhatsAppTemplateButton_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WhatsAppTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplateButton" ADD CONSTRAINT "WhatsAppTemplateButton_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "WhatsAppTemplateComponent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplateProviderPayload" ADD CONSTRAINT "WhatsAppTemplateProviderPayload_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WhatsAppTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplateEvent" ADD CONSTRAINT "WhatsAppTemplateEvent_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "WhatsAppTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WhatsAppTemplateEvent" ADD CONSTRAINT "WhatsAppTemplateEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
