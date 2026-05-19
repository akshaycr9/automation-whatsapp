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
};

export function TemplateMessageSection({
  headerFormat,
  headerText,
  bodyText,
  footerText,
  onHeaderFormatChange,
  onHeaderTextChange,
  onBodyTextChange,
  onFooterTextChange
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
        />
        <BodyEditor value={bodyText} onChange={onBodyTextChange} />
        <FooterEditor value={footerText} onChange={onFooterTextChange} />
      </div>
    </section>
  );
}
