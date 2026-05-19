import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
  BODY_TEXT_MAX_LENGTH,
  BUTTON_TEXT_MAX_LENGTH,
  DEFAULT_TEMPLATE_TYPE,
  FOOTER_TEXT_MAX_LENGTH,
  HEADER_TEXT_MAX_LENGTH,
  TEMPLATE_BUTTON_TOTAL_MAX_COUNT,
  TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT,
  TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT,
  TEMPLATE_URL_BUTTON_MAX_COUNT
} from "../constants/template.constants";
import type { ValidationChecklistItem } from "../components/TemplateBuilder/ValidationChecklist";
import { useCreateTemplate } from "./useCreateTemplate";
import type {
  CreateTemplateFormValues,
  TemplateButton,
  TemplateCategory,
  TemplateHeaderFormat
} from "../types/template.types";
import { areVariablesSequential, extractTemplateVariables } from "../utils/templateVariables";
import { isValidLanguageCode, isValidTemplateBody, isValidTemplateName } from "../utils/templateValidation";

export function useCreateTemplatePageState() {
  const navigate = useNavigate();
  const createTemplate = useCreateTemplate();
  const [feedback, setFeedback] = useState<string | null>(null);
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

  const detectedVariables = useMemo(
    () =>
      extractTemplateVariables(
        `${formValues.headerText ?? ""}\n${formValues.bodyText}\n${formValues.footerText ?? ""}`
      ),
    [formValues.bodyText, formValues.footerText, formValues.headerText]
  );
  const checklist = useMemo(() => buildChecklist(formValues, detectedVariables), [detectedVariables, formValues]);
  const canSubmit = checklist.every((item) => item.isValid);

  const updateForm = (nextValues: Partial<CreateTemplateFormValues>) => {
    setFeedback(null);
    setFormValues((current) => ({ ...current, ...nextValues }));
  };

  const updateSampleValue = (token: string, value: string) => {
    updateForm({ variableSamples: { ...formValues.variableSamples, [token]: value } });
  };

  const updateName = (name: string) => updateForm({ name });
  const updateDisplayName = (displayName: string) => updateForm({ displayName });
  const updateCategory = (category: TemplateCategory | "") => updateForm({ category });
  const updateLanguageCode = (languageCode: string) => updateForm({ languageCode });
  const updateHeaderFormat = (headerFormat: TemplateHeaderFormat) => updateForm({ headerFormat });
  const updateHeaderText = (headerText: string) => updateForm({ headerText });
  const updateBodyText = (bodyText: string) => updateForm({ bodyText });
  const updateFooterText = (footerText: string) => updateForm({ footerText });
  const updateButtons = (buttons: TemplateButton[]) => updateForm({ buttons });

  const saveDraft = () => {
    setFeedback("Draft saved locally for this mock flow.");
  };

  const cancel = () => {
    navigate("/templates");
  };

  const submitTemplate = async () => {
    if (!canSubmit) {
      setFeedback("Complete the readiness checklist before submitting this mock template.");
      return;
    }

    await createTemplate.mutateAsync(formValues);
    if (import.meta.env.DEV) {
      console.info("[Templates] mock submit", formValues);
    }
    setFeedback("Mock template saved. Backend submission will be connected in a later phase.");
  };

  return {
    cancel,
    canSubmit,
    checklist,
    createTemplate,
    detectedVariables,
    feedback,
    formValues,
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
    updateSampleValue
  };
}

function buildChecklist(
  values: CreateTemplateFormValues,
  variables: ReturnType<typeof extractTemplateVariables>
): ValidationChecklistItem[] {
  const buttonCounts = getButtonCounts(values.buttons);
  const buttonFieldsValid = values.buttons.every((button) => {
    const hasText = button.text.trim().length > 0 && button.text.length <= BUTTON_TEXT_MAX_LENGTH;
    if (button.type === "URL") {
      return hasText && /^https?:\/\/.+/i.test(button.value ?? "");
    }
    if (button.type === "PHONE_NUMBER") {
      return hasText && Boolean(button.value?.trim());
    }
    return hasText;
  });
  const buttonCountsValid =
    buttonCounts.total <= TEMPLATE_BUTTON_TOTAL_MAX_COUNT &&
    buttonCounts.quickReply <= TEMPLATE_QUICK_REPLY_BUTTON_MAX_COUNT &&
    buttonCounts.url <= TEMPLATE_URL_BUTTON_MAX_COUNT &&
    buttonCounts.phoneNumber <= TEMPLATE_PHONE_NUMBER_BUTTON_MAX_COUNT;
  const buttonGroupingValid = areButtonGroupsValid(values.buttons);

  return [
    { id: "name", label: "Template name added", isValid: values.name.trim().length > 0 },
    {
      id: "name-format",
      label: "Template name uses lowercase, numbers, and underscores",
      isValid: isValidTemplateName(values.name)
    },
    { id: "category", label: "Category selected", isValid: Boolean(values.category) },
    { id: "language", label: "Language selected", isValid: isValidLanguageCode(values.languageCode) },
    { id: "body", label: "Body message added", isValid: isValidTemplateBody(values.bodyText) },
    { id: "variables-sequential", label: "Variables are sequential", isValid: areVariablesSequential(variables) },
    {
      id: "variable-samples",
      label: "Sample values added for detected variables",
      isValid: variables.every((variable) => Boolean(values.variableSamples[variable.token]?.trim()))
    },
    {
      id: "lengths",
      label: "Header, body, and footer are within limits",
      isValid:
        (values.headerText ?? "").length <= HEADER_TEXT_MAX_LENGTH &&
        values.bodyText.length <= BODY_TEXT_MAX_LENGTH &&
        (values.footerText ?? "").length <= FOOTER_TEXT_MAX_LENGTH
    },
    { id: "button-fields", label: "Buttons have valid labels and destinations", isValid: buttonFieldsValid },
    { id: "button-counts", label: "Button counts stay within WhatsApp limits", isValid: buttonCountsValid },
    { id: "button-groups", label: "Quick reply and action buttons are grouped correctly", isValid: buttonGroupingValid }
  ];
}

function getButtonCounts(buttons: TemplateButton[]) {
  return {
    total: buttons.length,
    quickReply: buttons.filter((button) => button.type === "QUICK_REPLY").length,
    url: buttons.filter((button) => button.type === "URL").length,
    phoneNumber: buttons.filter((button) => button.type === "PHONE_NUMBER").length
  };
}

function areButtonGroupsValid(buttons: TemplateButton[]) {
  const groupSequence = buttons.map((button) => (button.type === "QUICK_REPLY" ? "QUICK_REPLY" : "ACTION"));
  const transitions = groupSequence.reduce((count, group, index) => {
    if (index === 0) {
      return count;
    }

    return group === groupSequence[index - 1] ? count : count + 1;
  }, 0);

  return transitions <= 1;
}
