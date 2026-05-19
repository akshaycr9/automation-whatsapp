# Templates Phase 6 Form Validation

## Summary

Phase 6 formalized the frontend validation layer for the Create Template screen. The form remains frontend-only and mock-submitted, but it now has structured validation results, derived variable state, field/section errors, and a normalized frontend payload mapper ready for a future backend API.

No backend routes, database work, Meta API integration, media upload, carousel templates, or authentication templates were added.

## Files Created

- `apps/web/src/features/templates/__tests__/template-validation.test.ts`
- `docs/templates-phase-6-form-validation.md`

## Files Updated

- `apps/web/src/features/templates/types/template.types.ts`
- `apps/web/src/features/templates/utils/templateValidation.ts`
- `apps/web/src/features/templates/utils/templateVariables.ts`
- `apps/web/src/features/templates/mappers/templateFormToApi.mapper.ts`
- `apps/web/src/features/templates/schemas/templateForm.schema.ts`
- `apps/web/src/features/templates/hooks/useCreateTemplatePageState.ts`
- `apps/web/src/features/templates/pages/create-template-page.tsx`
- Template builder components for field/section error display.

## Form State

The Create Template form remains controlled React state:

```ts
{
  name: "",
  displayName: "",
  category: "",
  languageCode: "",
  type: "TEXT",
  headerFormat: "NONE",
  headerText: "",
  bodyText: "",
  footerText: "",
  buttons: [],
  variableSamples: {}
}
```

Derived state is not stored:

- `detectedVariables`
- `validationResult`
- `canSubmit`
- `normalizedSubmitPayload`
- validation checklist items

## Validation Rules

- Template name is required, starts with a lowercase letter, and may contain only lowercase letters, numbers, and underscores.
- Category is required and must be one of `UTILITY`, `MARKETING`, or `AUTHENTICATION`.
- Language is required and must be one of the configured supported language codes.
- Template type must be `TEXT` in this phase.
- Header supports `NONE` and `TEXT`; text headers require text and do not support variables yet.
- Body is required, has a max length, supports numeric variables like `{{1}}`, and variables must be sequential.
- Every detected body variable requires a sample value.
- Footer is optional, has a max length, and does not support variables yet.
- Interactive actions support quick reply, URL, and phone number.
- Button text is required, has a max length, labels should be unique, URL actions need valid URLs, and phone actions need a valid-looking phone number.
- Button count limits use the existing WhatsApp constants.

## Variable Behavior

Variables are detected from the body only for MVP submission. Header/footer variables are rejected for now to keep the text-template MVP predictable.

Invalid variable syntax such as `{{name}}` or `{1}` is reported as a body validation error.

## Preview Behavior

`TemplatePreview` remains presentational. It uses `replaceVariablesWithSamples()` and keeps missing samples as placeholders. The UI still brackets sample values in preview so dynamic content is visually distinguishable.

## Submit Behavior

Submit runs `validateCreateTemplateForm()`.

If invalid:

- mock submit is blocked,
- the submit button remains disabled,
- field/section errors and checklist messages identify the problem.

If valid:

- `mapTemplateFormToApiPayload()` creates a normalized frontend payload,
- the mock create hook receives that payload,
- the payload is logged in development.

## Mapper Output

The mapper creates a backend-ready frontend payload:

- top-level template metadata,
- normalized `components.header/body/footer/buttons`,
- normalized body variable samples.

It intentionally does not create a final Meta API payload. That belongs on the backend in a later phase.

## Tests

Added utility tests for:

- template name validation,
- variable extraction,
- sequential variable validation,
- invalid variable syntax,
- sample replacement,
- button validation,
- full form validation,
- payload mapping.

Existing create-page tests continue to cover UI behavior.

## Known Limitations

- React Hook Form + Zod is not integrated yet; custom validation is active for this phase.
- Header/footer variables are disallowed.
- URL variables are deferred.
- Phone validation is intentionally basic.
- Submit remains mock/local only.

## Phase 7 Readiness Checklist

- [ ] Decide whether to migrate this custom validation into Zod schemas.
- [ ] Connect normalized payload to backend contract once approved.
- [ ] Add backend validation using the same rules or stricter server rules.
- [ ] Add draft persistence.
- [ ] Add Meta submission lifecycle states.
- [ ] Extend the form registry for media, carousel, and authentication templates.
