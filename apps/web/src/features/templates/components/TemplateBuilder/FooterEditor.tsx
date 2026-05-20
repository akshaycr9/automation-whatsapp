import { FOOTER_TEXT_MAX_LENGTH } from "../../constants/template.constants";

type FooterEditorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
};

export function FooterEditor({ value, onChange, error }: FooterEditorProps) {
  return (
    <section className="space-y-1.5">
      <label className="text-sm font-medium text-text-muted" htmlFor="template-footer-text">
        Footer
      </label>
      <input
        id="template-footer-text"
        className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
        maxLength={FOOTER_TEXT_MAX_LENGTH}
        placeholder="Reply STOP to opt out"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="text-xs text-text-subtle">
        {value.length}/{FOOTER_TEXT_MAX_LENGTH}
      </p>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </section>
  );
}
