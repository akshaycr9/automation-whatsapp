import type { TemplateCategory, TemplateStatus, TemplateType } from "../types/template.types";

const statusLabels: Record<TemplateStatus, string> = {
  DRAFT: "Draft",
  SUBMITTING: "Submitting",
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PAUSED: "Paused",
  DISABLED: "Disabled",
  DELETED: "Deleted",
  ERROR: "Error"
};

const categoryLabels: Record<TemplateCategory, string> = {
  UTILITY: "Utility",
  MARKETING: "Marketing",
  AUTHENTICATION: "Authentication"
};

const typeLabels: Record<TemplateType, string> = {
  TEXT: "Text",
  MEDIA: "Media",
  CAROUSEL: "Carousel",
  AUTHENTICATION: "Authentication"
};

export function formatTemplateStatus(status: TemplateStatus) {
  return statusLabels[status];
}

export function formatTemplateCategory(category: TemplateCategory) {
  return categoryLabels[category];
}

export function formatTemplateType(type: TemplateType) {
  return typeLabels[type];
}

export function formatTemplateDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

export function getStatusBadgeClasses(status: TemplateStatus) {
  const classes: Record<TemplateStatus, string> = {
    APPROVED: "bg-success-soft text-brand-hover",
    PENDING: "bg-warning-soft text-[#92400e]",
    REJECTED: "bg-error-soft text-[#b91c1c]",
    DRAFT: "bg-surface-2 text-text-muted",
    SUBMITTING: "bg-info-soft text-[#1d4ed8]",
    PAUSED: "bg-info-soft text-[#1d4ed8]",
    DISABLED: "bg-surface-2 text-text-muted",
    DELETED: "bg-error-soft text-[#b91c1c]",
    ERROR: "bg-error-soft text-[#b91c1c]"
  };

  return classes[status];
}

export function getCategoryBadgeClasses(category: TemplateCategory) {
  const classes: Record<TemplateCategory, string> = {
    UTILITY: "bg-info-soft text-[#1d4ed8]",
    MARKETING: "bg-warning-soft text-[#92400e]",
    AUTHENTICATION: "bg-brand-soft text-brand-hover"
  };

  return classes[category];
}
