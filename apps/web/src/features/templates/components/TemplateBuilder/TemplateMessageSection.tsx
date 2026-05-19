import type { TemplateHeaderFormat } from "../../types/template.types";
import { BodyEditor } from "./BodyEditor";
import { FooterEditor } from "./FooterEditor";
import { HeaderEditor } from "./HeaderEditor";

type TemplateMessageSectionProps = {
  headerFormat: TemplateHeaderFormat;
  headerText: string;
  bodyText: string;
  footerText: string;
  onHeaderFormatChange: (value: TemplateHeaderFormat) => void;
  onHeaderTextChange: (value: string) => void;
  onBodyTextChange: (value: string) => void;
  onFooterTextChange: (value: string) => void;
  errors?: Partial<Record<"headerText" | "bodyText" | "footerText", string[]>>;
};

export function TemplateMessageSection({
  headerFormat,
  headerText,
  bodyText,
  footerText,
  onHeaderFormatChange,
  onHeaderTextChange,
  onBodyTextChange,
  onFooterTextChange,
  errors = {}
}: TemplateMessageSectionProps) {
  return (
    <section
      className="rounded-lg border border-border bg-surface p-4 shadow-sm"
      aria-labelledby="template-message-title"
    >
      <h2 id="template-message-title" className="text-base font-semibold text-text">
        Message content
      </h2>
      <div className="mt-4 space-y-5">
        <HeaderEditor
          format={headerFormat}
          text={headerText}
          onFormatChange={onHeaderFormatChange}
          onTextChange={onHeaderTextChange}
          error={errors.headerText?.[0]}
        />
        <BodyEditor value={bodyText} onChange={onBodyTextChange} error={errors.bodyText?.[0]} />
        <FooterEditor value={footerText} onChange={onFooterTextChange} error={errors.footerText?.[0]} />
      </div>
    </section>
  );
}
