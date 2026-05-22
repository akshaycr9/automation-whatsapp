import { Card } from "@/components/ui/card";
import { AutomationIcon } from "./AutomationIcon";
import type { AutomationDetail, AutomationVariableMapping } from "../types/automation.types";

type AutomationPreviewPanelProps = {
  automation: AutomationDetail;
  mappings: AutomationVariableMapping[];
};

export function AutomationPreviewPanel({ automation, mappings }: AutomationPreviewPanelProps) {
  const template = automation.template;

  if (!template) {
    return (
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
          <AutomationIcon name="phone" />
          Example output
        </div>
        <div className="rounded-lg border border-dashed border-border bg-surface-2 px-4 py-10 text-center text-sm text-text-muted">
          Select a WhatsApp template to preview the message.
        </div>
      </Card>
    );
  }

  const body = template.components?.find((component) => component.type === "BODY")?.text ?? "Template body preview";
  const header = template.components?.find((component) => component.type === "HEADER")?.text;
  const footer = template.components?.find((component) => component.type === "FOOTER")?.text;
  const buttons = template.components?.find((component) => component.type === "BUTTONS")?.buttons ?? [];
  const resolved = automation.requiredVariables.map((variable) => {
    const mapping = mappings.find(
      (item) => item.componentType === variable.componentType && item.variableIndex === variable.variableIndex
    );

    return {
      variable,
      mapping,
      value:
        mapping?.fallbackValue ||
        sampleValueForSource(mapping?.sourceField) ||
        variable.sampleValue ||
        variable.placeholder
    };
  });

  return (
    <div className="space-y-3 xl:sticky xl:top-20">
      <div className="flex items-center gap-2 text-sm font-medium text-text-muted">
        <AutomationIcon name="phone" />
        Example output
      </div>
      <div className="min-h-[420px] rounded-lg bg-[#ece5dd] bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02)_12px,transparent_12px,transparent_24px)] p-5 dark:bg-surface-2">
        <div className="max-w-[320px] rounded-lg rounded-tl-sm bg-white px-3 py-2 text-[13px] leading-6 text-[#111b21] shadow-sm">
          {header ? <div className="mb-1 font-semibold">{renderWithVariables(header, resolved)}</div> : null}
          <div className="whitespace-pre-wrap">{renderWithVariables(body, resolved)}</div>
          {footer ? <div className="mt-2 text-xs text-[#667781]">{footer}</div> : null}
          <div className="mt-1 text-right text-[10px] text-[#667781]">2:14 PM</div>
        </div>
        {buttons.length > 0 ? (
          <div className="mt-2 flex max-w-[320px] flex-col gap-1">
            {buttons.map((button) => (
              <button
                key={button.id}
                className="rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-[#008069] shadow-sm"
                type="button"
              >
                {button.text}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {resolved.length > 0 ? (
        <Card className="space-y-2 p-3 text-xs">
          <p className="font-medium uppercase tracking-[0.06em] text-text-subtle">Resolved variables</p>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {resolved.map(({ variable, mapping, value }) => (
              <div key={`${variable.componentType}-${variable.variableIndex}`} className="contents">
                <span className="font-mono text-brand-hover">{variable.placeholder}</span>
                <span className="text-text-muted">
                  {mapping?.sourceField || "unmapped"} {"->"} "{value}"
                </span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

function renderWithVariables(
  text: string,
  resolved: Array<{ variable: { variableIndex: number; placeholder: string }; value: string }>
) {
  const parts: React.ReactNode[] = [text];

  for (const item of resolved) {
    const token = `{{${item.variable.variableIndex}}}`;
    const nextParts: React.ReactNode[] = [];

    parts.forEach((part) => {
      if (typeof part !== "string") {
        nextParts.push(part);
        return;
      }

      const split = part.split(token);
      split.forEach((segment, index) => {
        if (segment) nextParts.push(segment);
        if (index < split.length - 1) {
          nextParts.push(
            <span
              key={`${token}-${nextParts.length}`}
              className="rounded bg-brand-soft px-1 font-mono text-[11px] text-brand-hover"
            >
              {item.value}
            </span>
          );
        }
      });
    });

    parts.splice(0, parts.length, ...nextParts);
  }

  return parts;
}

function sampleValueForSource(sourceField: string | undefined) {
  const samples: Record<string, string> = {
    "customer.firstName": "Aanya",
    "customer.lastName": "Shah",
    "customer.fullName": "Aanya Shah",
    "customer.phone": "+91 98765 43210",
    "customer.email": "aanya@example.com",
    "order.id": "1042",
    "order.name": "#1042",
    "order.totalPrice": "1299",
    "order.currency": "INR",
    "order.codAmount": "1299",
    "order.confirmUrl": "Confirm link",
    "order.cancelUrl": "Cancel link",
    "checkout.recoveryUrl": "Recovery link",
    "checkout.firstProductName": "Cotton Kurta",
    "checkout.productCount": "3"
  };

  return sourceField ? samples[sourceField] : "";
}
