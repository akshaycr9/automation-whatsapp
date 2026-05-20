import { ApiError } from "@/lib/api-client";
import type { Template } from "../types/template.types";
import { formatTemplateStatus } from "./templateFormatters";

export function getTemplateActionErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  if (error.code === "UNAUTHORIZED") {
    return "Your session has expired. Please sign in again.";
  }

  return error.message || fallback;
}

export function buildTemplateStatusMessage(template: Template, action: "synced" | "resubmitted") {
  return `${template.displayName} ${action}. Status is ${formatTemplateStatus(template.status)}.`;
}

export function buildCreateTemplateSuccessMessage(template: Template) {
  return `Template submitted to Meta for approval. Current status: ${formatTemplateStatus(template.status)}.`;
}

export function buildBulkSyncMessage(counts: { updatedCount: number; failedCount: number }) {
  return `Templates synced. Updated ${counts.updatedCount}, failed ${counts.failedCount}.`;
}
