import type { ComponentType } from "react";
import { TextTemplateForm } from "../components/TemplateBuilder/TextTemplateForm";
import type {
  CreateTemplateFormValues,
  TemplateButton,
  TemplateHeaderFormat,
  TemplateType,
  TemplateValidationResult,
  TemplateVariable
} from "../types/template.types";

export type TemplateTypeFormProps = {
  formValues: CreateTemplateFormValues;
  detectedVariables: TemplateVariable[];
  visibleErrors: TemplateValidationResult["errors"];
  onHeaderFormatChange: (value: TemplateHeaderFormat) => void;
  onHeaderTextChange: (value: string) => void;
  onBodyTextChange: (value: string) => void;
  onFooterTextChange: (value: string) => void;
  onButtonsChange: (buttons: TemplateButton[]) => void;
  onSampleValueChange: (token: string, value: string) => void;
};

export type TemplateTypeConfig = {
  type: TemplateType;
  label: string;
  description: string;
  isEnabled: boolean;
  supportedHeaderFormats: TemplateHeaderFormat[];
  supportedButtonTypes: Array<"QUICK_REPLY" | "URL" | "PHONE_NUMBER">;
  supportsVariables: boolean;
  supportsMedia: boolean;
  supportsCarouselCards: boolean;
  component: ComponentType<TemplateTypeFormProps>;
};

export const templateTypeRegistry: Record<TemplateType, TemplateTypeConfig> = {
  TEXT: {
    type: "TEXT",
    label: "Text Template",
    description: "Basic WhatsApp text template with optional text header, body, footer, and interactive actions.",
    isEnabled: true,
    supportedHeaderFormats: ["NONE", "TEXT"],
    supportedButtonTypes: ["QUICK_REPLY", "URL", "PHONE_NUMBER"],
    supportsVariables: true,
    supportsMedia: false,
    supportsCarouselCards: false,
    component: TextTemplateForm
  },
  MEDIA: {
    type: "MEDIA",
    label: "Media Template",
    description: "Coming soon: image, video, and document header templates.",
    isEnabled: false,
    supportedHeaderFormats: ["IMAGE", "VIDEO", "DOCUMENT"],
    supportedButtonTypes: ["QUICK_REPLY", "URL", "PHONE_NUMBER"],
    supportsVariables: true,
    supportsMedia: true,
    supportsCarouselCards: false,
    component: UnsupportedTemplateTypePlaceholder
  },
  CAROUSEL: {
    type: "CAROUSEL",
    label: "Carousel Template",
    description: "Coming soon: multi-card marketing templates.",
    isEnabled: false,
    supportedHeaderFormats: ["IMAGE", "VIDEO"],
    supportedButtonTypes: ["QUICK_REPLY", "URL"],
    supportsVariables: true,
    supportsMedia: true,
    supportsCarouselCards: true,
    component: UnsupportedTemplateTypePlaceholder
  },
  AUTHENTICATION: {
    type: "AUTHENTICATION",
    label: "Authentication Template",
    description: "Coming soon: OTP and verification code templates.",
    isEnabled: false,
    supportedHeaderFormats: ["NONE"],
    supportedButtonTypes: [],
    supportsVariables: false,
    supportsMedia: false,
    supportsCarouselCards: false,
    component: UnsupportedTemplateTypePlaceholder
  }
};

export function getTemplateTypeConfig(type: TemplateType) {
  return templateTypeRegistry[type];
}

function UnsupportedTemplateTypePlaceholder() {
  return (
    <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <h2 className="text-base font-semibold text-text">Template type coming soon</h2>
      <p className="mt-1 text-sm text-text-muted">
        This template type is visible for planning, but only text templates can be created in this phase.
      </p>
    </section>
  );
}
