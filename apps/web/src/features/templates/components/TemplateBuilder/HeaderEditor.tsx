import { HEADER_TEXT_MAX_LENGTH } from "../../constants/template.constants";
import type { TemplateHeaderFormat } from "../../types/template.types";

type HeaderEditorProps = {
  format: TemplateHeaderFormat;
  text: string;
  onFormatChange: (value: TemplateHeaderFormat) => void;
  onTextChange: (value: string) => void;
};

export function HeaderEditor({ format, text, onFormatChange, onTextChange }: HeaderEditorProps) {
  return (
    <section className="space-y-3" aria-labelledby="template-header-title">
      <div>
        <h3 id="template-header-title" className="text-sm font-semibold text-text">
          Header
        </h3>
        <p className="mt-1 text-xs text-text-subtle">Optional text header. Media headers come later.</p>
      </div>
      <select
        className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        value={format}
        onChange={(event) => onFormatChange(event.target.value as TemplateHeaderFormat)}
        aria-label="Header format"
      >
        <option value="NONE">None</option>
        <option value="TEXT">Text</option>
      </select>
      {format === "TEXT" ? (
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-text-muted" htmlFor="template-header-text">
            Header text
          </label>
          <input
            id="template-header-text"
            className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            maxLength={HEADER_TEXT_MAX_LENGTH}
            placeholder="Order update"
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
          />
          <p className="text-xs text-text-subtle">
            {text.length}/{HEADER_TEXT_MAX_LENGTH}
          </p>
        </div>
      ) : null}
    </section>
  );
}
