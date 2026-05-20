import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "@/lib/api-client";
import { DEFAULT_TEMPLATE_TYPE } from "../constants/template.constants";
import { mapTemplateFormToApiPayload } from "../mappers/templateFormToApi.mapper";
import { useCreateTemplate } from "./useCreateTemplate";
import { buildCreateTemplateSuccessMessage } from "../utils/templateActionMessages";
import type {
  CreateTemplateFormValues,
  TemplateButton,
  TemplateCategory,
  TemplateHeaderFormat,
  TemplateType
} from "../types/template.types";
import { extractBodyTemplateVariables } from "../utils/templateVariables";
import { validateTemplateByType } from "../utils/templateValidation";

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
  const validationResult = useMemo(() => validateTemplateByType(formValues), [formValues]);
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
  const updateType = (type: TemplateType) => updateForm({ type });
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
    setFeedback("Draft saving in the browser is not connected yet.");
  };

  const cancel = () => {
    navigate("/templates");
  };

  const submitTemplate = async () => {
    setHasAttemptedSubmit(true);

    if (!canSubmit) {
      setFeedback("Complete the readiness checklist before submitting this template.");
      return;
    }

    const payload = mapTemplateFormToApiPayload(formValues, detectedVariables);
    try {
      const response = await createTemplate.mutateAsync(payload);
      navigate("/templates", {
        state: {
          templateNotification: {
            variant: "success",
            message: buildCreateTemplateSuccessMessage(response.data)
          }
        }
      });
    } catch (error) {
      setFeedback(getCreateTemplateErrorMessage(error));
    }
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
    updateType,
    visibleErrors,
    validationResult
  };
}

function getCreateTemplateErrorMessage(error: unknown) {
  if (!(error instanceof ApiError)) {
    return "Template could not be submitted. Please try again.";
  }

  switch (error.code) {
    case "TEMPLATE_DUPLICATE_NAME":
      return "A template with this name and language already exists.";
    case "TEMPLATE_PROVIDER_ERROR":
      return "Template could not be submitted to Meta. Please review and try again.";
    case "TEMPLATE_UNSUPPORTED_TYPE":
      return "Only text templates can be submitted right now.";
    case "TEMPLATE_VALIDATION_ERROR":
      return "Some template details need attention before submission.";
    case "UNAUTHORIZED":
      return "Your session has expired. Please sign in again.";
    default:
      return error.message || "Template could not be submitted. Please try again.";
  }
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
