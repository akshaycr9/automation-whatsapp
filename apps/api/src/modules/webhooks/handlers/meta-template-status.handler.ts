import { TemplateEventType, TemplateProviderAction, TemplateQualityRating, TemplateStatus } from "@prisma/client";
import {
  isKnownMetaTemplateStatus,
  mapMetaTemplateStatus
} from "../../templates/providers/meta/meta-template.mapper.js";
import { TemplateRepository } from "../../templates/repositories/template.repository.js";
import type { MetaWebhookFieldHandler, MetaWebhookPayload } from "../meta-webhook.types.js";

type TemplateStatusEvent = {
  metaTemplateId: string | null;
  name: string | null;
  languageCode: string | null;
  wabaId: string | null;
  rawStatus: string | null;
  status: TemplateStatus | null;
  qualityRating: TemplateQualityRating;
  rejectionReason: string | null;
  raw: unknown;
};

export class MetaTemplateStatusWebhookHandler implements MetaWebhookFieldHandler {
  readonly field = "message_template_status_update";

  constructor(private readonly repository = new TemplateRepository()) {}

  async handle(payload: MetaWebhookPayload) {
    const events = this.extractTemplateStatusEvents(payload);
    let processedCount = 0;

    if (events.length === 0) {
      await this.repository.createProviderPayload({
        action: TemplateProviderAction.WEBHOOK,
        requestPayload: payload,
        errorCode: "META_TEMPLATE_WEBHOOK_UNSUPPORTED",
        errorMessage: "No template status events were found in the webhook payload."
      });

      return { processedCount: 0 };
    }

    for (const event of events) {
      const template = await this.repository.findByWebhookIdentity({
        metaTemplateId: event.metaTemplateId,
        name: event.name,
        languageCode: event.languageCode,
        wabaId: event.wabaId
      });

      const payloadRecord = await this.repository.createProviderPayload({
        templateId: template?.id ?? null,
        action: TemplateProviderAction.WEBHOOK,
        requestPayload: event.raw
      });

      if (!template) {
        await this.repository.updateProviderPayload(payloadRecord.id, {
          errorCode: "META_TEMPLATE_NOT_FOUND",
          errorMessage: "Template webhook did not match a local template."
        });
        continue;
      }

      const oldStatus = template.status;
      const updateData = {
        ...(event.status ? { status: event.status } : {}),
        qualityRating: event.qualityRating,
        rejectionReason: event.rejectionReason,
        lastSyncedAt: new Date()
      };

      await this.repository.updateFromWebhook(template.id, updateData);
      await this.repository.createEvent({
        templateId: template.id,
        eventType: TemplateEventType.WEBHOOK_RECEIVED,
        oldStatus,
        newStatus: event.status ?? oldStatus,
        message: "Meta template status webhook received.",
        metadata: { rawStatus: event.rawStatus, wabaId: event.wabaId }
      });

      if (event.status && event.status !== oldStatus) {
        await this.repository.createEvent({
          templateId: template.id,
          eventType: this.statusToEventType(event.status),
          oldStatus,
          newStatus: event.status,
          message: `Template status changed from ${oldStatus} to ${event.status}.`,
          metadata: { rawStatus: event.rawStatus, wabaId: event.wabaId }
        });
      }

      if (!event.status && event.rawStatus) {
        await this.repository.createEvent({
          templateId: template.id,
          eventType: TemplateEventType.ERROR,
          oldStatus,
          newStatus: oldStatus,
          message: "Meta sent an unknown template status.",
          metadata: { rawStatus: event.rawStatus, wabaId: event.wabaId }
        });
      }

      processedCount += 1;
    }

    return { processedCount };
  }

  private extractTemplateStatusEvents(payload: MetaWebhookPayload): TemplateStatusEvent[] {
    const events: TemplateStatusEvent[] = [];

    for (const entry of payload.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value ?? {};
        const rawStatus = getScalarString(value, ["event", "status", "message_template_status"]);
        const normalizedStatus = rawStatus ? mapMetaTemplateStatus(rawStatus, TemplateStatus.ERROR) : null;
        const isKnownStatus = isKnownMetaTemplateStatus(rawStatus ?? undefined);

        events.push({
          metaTemplateId: getScalarString(value, ["message_template_id", "template_id", "id"]),
          name: getScalarString(value, ["message_template_name", "template_name", "name"]),
          languageCode: getScalarString(value, ["message_template_language", "language", "language_code"]),
          wabaId: getScalarString(value, ["waba_id"]) ?? entry.id ?? null,
          rawStatus,
          status: rawStatus && isKnownStatus ? normalizedStatus : null,
          qualityRating: mapQuality(getScalarString(value, ["quality_score", "quality_rating"])),
          rejectionReason: getScalarString(value, ["rejected_reason", "rejection_reason", "reason"]),
          raw: { field: change.field, value }
        });
      }
    }

    return events;
  }

  private statusToEventType(status: TemplateStatus) {
    switch (status) {
      case TemplateStatus.APPROVED:
        return TemplateEventType.APPROVED;
      case TemplateStatus.REJECTED:
        return TemplateEventType.REJECTED;
      case TemplateStatus.PAUSED:
        return TemplateEventType.PAUSED;
      case TemplateStatus.DISABLED:
        return TemplateEventType.DISABLED;
      default:
        return TemplateEventType.ERROR;
    }
  }
}

function getScalarString(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return null;
}

function mapQuality(value: string | null) {
  if (
    value === TemplateQualityRating.GREEN ||
    value === TemplateQualityRating.YELLOW ||
    value === TemplateQualityRating.RED
  ) {
    return value;
  }
  return TemplateQualityRating.UNKNOWN;
}
