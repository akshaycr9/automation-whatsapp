# Templates Phase 5 Create Screen

## 1. Summary

Phase 5 implemented the frontend-only Create Template screen at `/templates/create` for the initial `TEXT` template MVP.

The screen includes a builder form, variable mapping, WhatsApp-style live preview, validation checklist, and mock submit/save behavior. No backend API, database, Meta API, real upload, media, carousel, or authentication template implementation was added.

## 2. Files Created/Updated

Created:

- `apps/web/src/features/templates/__tests__/create-template-page.test.tsx`
- `docs/templates-phase-5-create-screen.md`

Updated:

- `apps/web/src/features/templates/pages/create-template-page.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/TemplateBasicInfoSection.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/TemplateMessageSection.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/HeaderEditor.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/BodyEditor.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/FooterEditor.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/ButtonEditor.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/VariableMappingPanel.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/ValidationChecklist.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/TemplateBuilderShell.tsx`
- `apps/web/src/features/templates/components/TemplatePreview/TemplatePreview.tsx`
- `apps/web/src/features/templates/utils/templateVariables.ts`

## 3. Component Breakdown

`CreateTemplatePage`

- Container for local form state.
- Derives variables from text content.
- Builds validation checklist state.
- Owns mock submit/save/cancel behavior.

`TemplateBasicInfoSection`

- Template name, display name, category, language, and read-only text type.

`TemplateMessageSection`

- Composes header, body, and footer editors.

`ButtonEditor`

- Adds/removes optional quick reply, URL, and phone number buttons.

`VariableMappingPanel`

- Shows detected variables and editable sample values.

`TemplatePreview`

- Renders a WhatsApp-style preview and replaces variables with sample values.

`ValidationChecklist`

- Displays frontend readiness checks.

## 4. Form State Shape

The Phase 5 form uses local React state shaped around `CreateTemplateFormValues`:

- `name`
- `displayName`
- `category`
- `languageCode`
- `type`
- `headerFormat`
- `headerText`
- `bodyText`
- `footerText`
- `buttons`
- `variableSamples`

## 5. Variable Detection

Variables are detected with `extractTemplateVariables()` from header/body/footer text.

`replaceVariablesWithSamples()` replaces tokens such as `{{1}}` using the `variableSamples` map for preview rendering.

## 6. Preview Behavior

The preview renders:

- Header text when enabled.
- Body text.
- Footer text.
- Buttons.
- Sample values in place of detected variables.

Missing samples leave the original placeholder visible.

## 7. Validation Checklist

Frontend-only checks include:

- Name exists.
- Name format is valid.
- Category selected.
- Language selected.
- Body exists.
- Variables are sequential.
- Samples exist for detected variables.
- Header/body/footer lengths are within constants.
- Buttons are valid if added.

Submit is disabled until the checklist passes.

## 8. Error Boundaries

Phase 3 `SectionErrorBoundary` is used around:

- Template Builder.
- Template Preview.
- Template Validation.

## 9. Accessibility Notes

- Inputs, selects, and textareas have labels.
- Dynamic variable inputs have aria labels.
- Buttons have visible labels.
- Checklist uses text plus symbols, not color alone.
- Cancel navigates back to `/templates`.

## 10. Known Limitations

- Submit is mock-only.
- Save draft is inline feedback only.
- No real backend or Meta submission.
- No real media upload.
- No carousel/authentication UI.
- Button rules are basic and not final Meta validation.

## 11. Phase 6 Readiness Checklist

- [ ] Add full Zod schema and React Hook Form integration if desired.
- [ ] Normalize create payload through mapper before backend submission.
- [ ] Add backend API contract for create draft/submit.
- [ ] Add richer button validation and Meta-specific constraints.
- [ ] Add media/authentication/carousel form registry entries when approved.
