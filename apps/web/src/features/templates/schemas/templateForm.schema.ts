// Phase 6 keeps the Create Template form on controlled React state and custom
// validation helpers. React Hook Form + Zod can be layered in later without
// changing the form contract below.
export const templateFormSchemaStatus = "custom-validation-active";

export const templateFormSchemaShape = {
  name: "string",
  displayName: "string",
  category: "TemplateCategory | empty",
  languageCode: "supported language code",
  type: "TEXT",
  headerFormat: "NONE | TEXT",
  headerText: "string | optional",
  bodyText: "string",
  footerText: "string | optional",
  buttons: "TemplateButton[]",
  variableSamples: "Record<placeholder, sample>"
} as const;
