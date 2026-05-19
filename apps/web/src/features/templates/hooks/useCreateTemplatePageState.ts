import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { DEFAULT_TEMPLATE_TYPE } from "../constants/template.constants";
import { mapTemplateFormToApiPayload } from "../mappers/templateFormToApi.mapper";
import { useCreateTemplate } from "./useCreateTemplate";
import type {
  CreateTemplateFormValues,
  TemplateButton,
  TemplateCategory,
  TemplateHeaderFormat
} from "../types/template.types";
import { extractBodyTemplateVariables } from "../utils/templateVariables";
import { validateCreateTemplateForm } from "../utils/templateValidation";

type TemplateFormTouchedFields = Partial<
  Record<
    | "name"
    | "category"
    | "languageCode"
    | "headerText"
    | "bodyText"
    | "footerText"
    | "buttons"
    | `buttons.${number}`
    | `variables.${string}`,
    boolean
  >
>;

export function useCreateTemplatePageState() {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [touchedFields, setTouchedFields] = useState<TemplateFormTouchedFields>({});
  const [formValues, setFormValues] = useState<CreateTemplateFormValues>({
    name: "",
    displayName: "",
    category: "",
    languageCode: "",
    type: DEFAULT_TEMPLATE_TYPE,
    headerFormat: "NONE",
    headerText: "",
    bodyText: "",
    footerText: "",
    buttons: [],
    variableSamples: {}
  });

  const detectedVariables = useMemo(() => extractBodyTemplateVariables(formValues.bodyText), [formValues.bodyText]);
  const validationResult = useMemo(() => validateCreateTemplateForm(formValues), [formValues]);
  const normalizedSubmitPayload = useMemo(
    () => (validationResult.isValid ? mapTemplateFormToApiPayload(formValues, detectedVariables) : null),
    [detectedVariables, formValues, validationResult.isValid]
  );
  const canSubmit = validationResult.isValid;
  const visibleErrors = useMemo(
    () => getVisibleErrors(validationResult.errors, touchedFields, hasAttemptedSubmit),
    [hasAttemptedSubmit, touchedFields, validationResult.errors]
  );

  const markTouched = (...fields: Array<keyof TemplateFormTouchedFields>) => {
    setTouchedFields((current) => ({
      ...current,
      ...Object.fromEntries(fields.map((field) => [field, true]))
    }));
  };

  const updateForm = (
    nextValues: Partial<CreateTemplateFormValues>,
    touchedField?: keyof TemplateFormTouchedFields
  ) => {
    setFeedback(null);
    if (touchedField) {
      markTouched(touchedField);
    }
    setFormValues((current) => ({ ...current, ...nextValues }));
  };

  const updateSampleValue = (token: string, value: string) => {
    updateForm({ variableSamples: { ...formValues.variableSamples, [token]: value } }, `variables.${token}`);
  };

  const updateName = (name: string) => updateForm({ name }, "name");
  const updateDisplayName = (displayName: string) => updateForm({ displayName });
  const updateCategory = (category: TemplateCategory | "") => updateForm({ category }, "category");
  const updateLanguageCode = (languageCode: string) => updateForm({ languageCode }, "languageCode");
  const updateHeaderFormat = (headerFormat: TemplateHeaderFormat) => updateForm({ headerFormat }, "headerText");
  const updateHeaderText = (headerText: string) => updateForm({ headerText }, "headerText");
  const updateBodyText = (bodyText: string) => updateForm({ bodyText }, "bodyText");
  const updateFooterText = (footerText: string) => updateForm({ footerText }, "footerText");
  const updateButtons = (buttons: TemplateButton[]) => {
    setFeedback(null);
    const touchedButtonFields = buttons.map((_, index) => `buttons.${index}` as const);
    markTouched("buttons", ...touchedButtonFields);
    setFormValues((current) => ({ ...current, buttons }));
  };

  const saveDraft = () => {
    setFeedback("Draft saved locally for this mock flow.");
  };

  const cancel = () => {
    navigate("/templates");
  };

  const submitTemplate = async () => {
    setHasAttemptedSubmit(true);

    if (!canSubmit) {
      setFeedback("Complete the readiness checklist before submitting this mock template.");
      return;
    }

    const payload = mapTemplateFormToApiPayload(formValues, detectedVariables);
    await createTemplate.mutateAsync(payload);
    if (import.meta.env.DEV) {
      console.info("[Templates] mock submit", payload);
    }
    setFeedback("Mock template saved. Backend submission will be connected in a later phase.");
  };

  return {
    cancel,
    canSubmit,
    checklist: validationResult.checklist,
    createTemplate,
    detectedVariables,
    feedback,
    formValues,
    normalizedSubmitPayload,
    saveDraft,
    submitTemplate,
    updateBodyText,
    updateButtons,
    updateCategory,
    updateDisplayName,
    updateFooterText,
    updateHeaderFormat,
    updateHeaderText,
    updateLanguageCode,
    updateName,
    updateSampleValue,
    visibleErrors,
    validationResult
  };
}

function getVisibleErrors(
  errors: Record<string, string[]>,
  touchedFields: TemplateFormTouchedFields,
  hasAttemptedSubmit: boolean
) {
  if (hasAttemptedSubmit) {
    return errors;
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([field]) => {
      if (touchedFields[field as keyof TemplateFormTouchedFields]) {
        return true;
      }
      if (field.startsWith("variables.")) {
        return Boolean(touchedFields[field as keyof TemplateFormTouchedFields] || touchedFields.bodyText);
      }
      if (field.startsWith("buttons.")) {
        return Boolean(touchedFields[field as keyof TemplateFormTouchedFields] || touchedFields.buttons);
      }

      return false;
    })
  );
}
