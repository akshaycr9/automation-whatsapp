import type { TemplateButton, TemplateHeaderFormat } from "../../types/template.types";
import { replaceVariablesWithSamples } from "../../utils/templateVariables";

type TemplatePreviewProps = {
  headerFormat: TemplateHeaderFormat;
  headerText: string;
  bodyText: string;
  footerText: string;
  buttons: TemplateButton[];
  sampleValues: Record<string, string>;
};

export function TemplatePreview({
  headerFormat,
  headerText,
  bodyText,
  footerText,
  buttons,
  sampleValues
}: TemplatePreviewProps) {
  return (
    <aside className="rounded-lg border border-border bg-surface p-4 shadow-sm" aria-label="Template message">
      <div className="rounded-lg bg-[#ece5dd] p-4">
        <div className="max-w-sm rounded-lg rounded-tl-sm bg-white p-3 text-[#111b21] shadow-sm">
          {headerFormat === "TEXT" && headerText ? (
            <div className="mb-2 font-semibold">{formatPreviewText(headerText, sampleValues)}</div>
          ) : null}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {formatPreviewText(bodyText || "Your message body will appear here.", sampleValues)}
          </div>
          {footerText ? (
            <div className="mt-2 text-xs text-[#667781]">{formatPreviewText(footerText, sampleValues)}</div>
          ) : null}
          <div className="mt-1 text-right text-[10px] text-[#667781]">2:14 PM</div>
        </div>
        {buttons.length > 0 ? (
          <div className="mt-2 max-w-sm space-y-1">
            {buttons.map((button) => (
              <button
                key={button.id}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#008069]"
                type="button"
              >
                <ActionIcon type={button.type} />
                <span>{button.text || "Button"}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function formatPreviewText(text: string, sampleValues: Record<string, string>) {
  const previewSamples = Object.fromEntries(
    Object.entries(sampleValues).map(([token, value]) => [token, value.trim() ? `[${value}]` : value])
  );

  return replaceVariablesWithSamples(text, previewSamples);
}

function ActionIcon({ type }: { type: TemplateButton["type"] }) {
  if (type === "URL") {
    return (
      <svg aria-label="URL action" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24">
        <path d="M14 5h5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        <path d="m10 14 9-9" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
        <path
          d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  if (type === "PHONE_NUMBER") {
    return (
      <svg aria-label="Phone action" className="size-4 shrink-0" fill="none" viewBox="0 0 24 24">
        <path
          d="M22 16.9v3a2 2 0 0 1-2.18 2 19.7 19.7 0 0 1-8.59-3.05 19.3 19.3 0 0 1-5.95-5.95A19.7 19.7 0 0 1 2.23 4.3 2 2 0 0 1 4.22 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.11L8.16 9.9a16 16 0 0 0 5.95 5.95l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.9Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    );
  }

  return null;
}
