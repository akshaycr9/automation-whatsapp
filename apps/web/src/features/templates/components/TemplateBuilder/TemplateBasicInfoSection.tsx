import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { TEMPLATE_CATEGORIES, TEMPLATE_LANGUAGE_OPTIONS } from "../../constants/template.constants";
import type { TemplateCategory, TemplateType } from "../../types/template.types";
import { formatTemplateCategory, formatTemplateType } from "../../utils/templateFormatters";

type TemplateBasicInfoSectionProps = {
  name: string;
  displayName: string;
  category: TemplateCategory | "";
  languageCode: string;
  type: TemplateType;
  onNameChange: (value: string) => void;
  onDisplayNameChange: (value: string) => void;
  onCategoryChange: (value: TemplateCategory | "") => void;
  onLanguageCodeChange: (value: string) => void;
  errors?: Partial<Record<"name" | "category" | "languageCode", string[]>>;
};

export function TemplateBasicInfoSection({
  name,
  displayName,
  category,
  languageCode,
  type,
  onNameChange,
  onDisplayNameChange,
  onCategoryChange,
  onLanguageCodeChange,
  errors = {}
}: TemplateBasicInfoSectionProps) {
  return (
    <section
      className="rounded-lg border border-border bg-surface p-4 shadow-sm"
      aria-labelledby="template-basic-info-title"
    >
      <h2 id="template-basic-info-title" className="text-base font-semibold text-text">
        Basic information
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Template name"
          htmlFor="template-name"
          help="Lowercase letters, numbers, and underscores only."
          error={errors.name?.[0]}
        >
          <Input
            id="template-name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="order_update_v1"
          />
        </Field>
        <Field label="Display name" htmlFor="template-display-name" help="Internal friendly name for this template.">
          <Input
            id="template-display-name"
            value={displayName}
            onChange={(event) => onDisplayNameChange(event.target.value)}
            placeholder="Order update"
          />
        </Field>
        <Field label="Category" htmlFor="template-category" error={errors.category?.[0]}>
          <select
            id="template-category"
            className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as TemplateCategory | "")}
          >
            <option value="">Select category</option>
            {TEMPLATE_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {formatTemplateCategory(option)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Language" htmlFor="template-language" error={errors.languageCode?.[0]}>
          <select
            id="template-language"
            className="block min-h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20"
            value={languageCode}
            onChange={(event) => onLanguageCodeChange(event.target.value)}
          >
            <option value="">Select language</option>
            {TEMPLATE_LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label} · {option.code}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Template type" htmlFor="template-type" help="Only text templates are available in this phase.">
          <Input id="template-type" disabled value={formatTemplateType(type)} readOnly />
        </Field>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  help,
  error,
  children
}: {
  label: string;
  htmlFor: string;
  help?: string;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-text-muted" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-error">{error}</p>
      ) : help ? (
        <p className="text-xs text-text-subtle">{help}</p>
      ) : null}
    </div>
  );
}
