# Templates Phase 7 Template Type Architecture

## Summary

Phase 7 introduced a template-type architecture around the existing working `TEXT` template implementation. The current behavior remains the same for text templates, while future `MEDIA`, `CAROUSEL`, and `AUTHENTICATION` templates now have clear registry, renderer, validation, mapper, and preview extension points.

No media, carousel, authentication, backend, database, or Meta API implementation was added.

## Files Created

- `apps/web/src/features/templates/config/templateTypeRegistry.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/TextTemplateForm.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/TemplateFormRenderer.tsx`
- `apps/web/src/features/templates/components/TemplatePreview/TemplatePreviewRenderer.tsx`
- `apps/web/src/features/templates/mappers/textTemplateFormToApi.mapper.ts`
- `apps/web/src/features/templates/__tests__/template-type-architecture.test.tsx`
- `docs/templates-phase-7-template-type-architecture.md`

## Files Modified

- `apps/web/src/features/templates/pages/create-template-page.tsx`
- `apps/web/src/features/templates/components/TemplateBuilder/TemplateBasicInfoSection.tsx`
- `apps/web/src/features/templates/utils/templateValidation.ts`
- `apps/web/src/features/templates/mappers/templateFormToApi.mapper.ts`
- `apps/web/src/features/templates/hooks/useCreateTemplatePageState.ts`

## Registry

`templateTypeRegistry` defines each template type with:

- label and description,
- enabled/disabled status,
- supported header formats,
- supported button types,
- variable/media/carousel support flags,
- a form component.

Only `TEXT` is enabled. Future types are visible in the selector as disabled `Coming soon` options.

## TEXT Extraction

The current TEXT-specific builder sections moved behind `TextTemplateForm`:

- message content,
- interactive actions,
- variable samples.

`CreateTemplatePage` now delegates type-specific form rendering to `TemplateFormRenderer`.

## Validation Strategy

`validateTemplateByType()` now resolves validation by template type.

- `TEXT` delegates to the existing text validation.
- Unsupported types return an invalid result with a clear coming-soon message.

## Mapper Strategy

`mapTemplateFormToApiPayload()` is now type-aware.

- `TEXT` delegates to `mapTextTemplateFormToApiPayload()`.
- Unsupported types throw a safe error.

The mapper still creates a frontend-to-backend payload, not a Meta API payload.

## Preview Strategy

`TemplatePreviewRenderer` delegates preview rendering by template type.

- `TEXT` uses the existing WhatsApp text preview.
- Future template types show a coming-soon preview placeholder if rendered directly.

## Future Steps

- Add `MediaTemplateForm`, `MediaTemplatePreview`, validation, and mapper.
- Add `CarouselTemplateForm`, card validation, and carousel preview.
- Add `AuthenticationTemplateForm` with OTP-specific validation.
- Consider migrating the custom validation layer to Zod once the backend contract is approved.

## Phase 8 Readiness Checklist

- [ ] Decide the next supported template type.
- [ ] Add type-specific form component.
- [ ] Add type-specific validation resolver branch.
- [ ] Add type-specific payload mapper.
- [ ] Add type-specific preview renderer.
- [ ] Add tests for the new template type without changing TEXT behavior.
