import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Template, TemplateButton, TemplateHeaderFormat } from "../../types/template.types";
import { formatTemplateCategory } from "../../utils/templateFormatters";
import { TemplatePreview } from "../TemplatePreview/TemplatePreview";

type TemplateDetailModalProps = {
  template: Template | null;
  isLoading?: boolean;
  onClose: () => void;
};

export function TemplateDetailModal({ template, isLoading = false, onClose }: TemplateDetailModalProps) {
  useEffect(() => {
    if (!template) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, template]);

  if (!template) return null;

  const preview = getPreviewModel(template);

  return (
    <div
      aria-labelledby="template-detail-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-3 py-4 sm:px-6"
      role="dialog"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[92vh] w-[95vw] max-w-md overflow-y-auto rounded-lg border border-border bg-surface shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-border bg-surface px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-normal text-text-muted">
              {formatTemplateCategory(template.category)}
            </p>
            <h2 id="template-detail-modal-title" className="mt-1 break-words text-lg font-semibold text-text">
              {template.displayName}
            </h2>
          </div>
          <Button
            aria-label="Close template details"
            className="min-h-9 shrink-0 px-3"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            <span aria-hidden="true" className="relative block size-4">
              <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 rotate-45 rounded-full bg-current" />
              <span className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 -rotate-45 rounded-full bg-current" />
            </span>
          </Button>
        </div>

        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className={cn("[&_aside]:border-0", "[&_aside]:p-0", "[&_aside]:shadow-none")}>
            <TemplatePreview
              bodyText={isLoading && !hasMessageContent(template) ? "Loading template message..." : preview.bodyText}
              buttons={preview.buttons}
              footerText={preview.footerText}
              headerFormat={preview.headerFormat}
              headerText={preview.headerText}
              sampleValues={preview.sampleValues}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function getPreviewModel(template: Template) {
  const components = template.components ?? [];
  const header = components.find((component) => component.type === "HEADER");
  const body = components.find((component) => component.type === "BODY");
  const footer = components.find((component) => component.type === "FOOTER");
  const buttons = components.find((component) => component.type === "BUTTONS");
  const sampleValues = Object.fromEntries(
    components
      .flatMap((component) => component.variables ?? [])
      .filter((variable) => variable.sampleValue)
      .map((variable) => [variable.token, variable.sampleValue ?? ""])
  );

  return {
    headerFormat: header?.format ?? ("NONE" as TemplateHeaderFormat),
    headerText: header?.text ?? "",
    bodyText: body?.text ?? "Template message is not available.",
    footerText: footer?.text ?? "",
    buttons: buttons?.buttons ?? ([] as TemplateButton[]),
    sampleValues
  };
}

function hasMessageContent(template: Template) {
  return Boolean(template.components?.some((component) => component.text || (component.buttons?.length ?? 0) > 0));
}
