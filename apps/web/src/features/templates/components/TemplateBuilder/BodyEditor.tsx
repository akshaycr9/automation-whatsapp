import { BODY_TEXT_MAX_LENGTH } from "../../constants/template.constants";

type BodyEditorProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string | undefined;
};

export function BodyEditor({ value, onChange, error }: BodyEditorProps) {
  return (
    <section className="space-y-1.5">
      <label className="text-sm font-medium text-text-muted" htmlFor="template-body-text">
        Body
      </label>
      <textarea
        id="template-body-text"
        className="min-h-36 w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition placeholder:text-text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20"
        maxLength={BODY_TEXT_MAX_LENGTH}
        placeholder="Hi {{1}}, your order {{2}} is confirmed."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <p className="text-xs text-text-subtle">
        {value.length}/{BODY_TEXT_MAX_LENGTH} · Use variables like {"{{1}}"}.
      </p>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </section>
  );
}
