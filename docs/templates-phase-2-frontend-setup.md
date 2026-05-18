# Templates Phase 2 Frontend Setup

## Summary

Phase 2 created the frontend foundation for the Templates feature without implementing the final list, create, detail, backend, database, or Meta integration flows.

The app is TypeScript-based, uses React Router for authenticated routes, Tailwind CSS v4 design tokens for styling, `@/*` path aliases, and TanStack Query through the existing app provider. The Templates scaffold follows those conventions.

## Files And Folders Created

Created under `apps/web/src/features/templates`:

```text
api/
  template.keys.ts
  templateApi.ts
components/
  TemplateBuilder/
    BodyEditor.tsx
    ButtonEditor.tsx
    FooterEditor.tsx
    HeaderEditor.tsx
    TemplateBasicInfoSection.tsx
    TemplateBuilderShell.tsx
    TemplateMessageSection.tsx
    ValidationChecklist.tsx
    VariableMappingPanel.tsx
  TemplateList/
    EmptyTemplatesState.tsx
    TemplateCategoryBadge.tsx
    TemplateFilters.tsx
    TemplateListHeader.tsx
    TemplateStatusBadge.tsx
    TemplateTable.tsx
  TemplatePreview/
    TemplatePreview.tsx
constants/
  template.constants.ts
data/
  mockTemplates.ts
hooks/
  useCreateTemplate.ts
  useSyncTemplates.ts
  useTemplate.ts
  useTemplates.ts
mappers/
  templateApiToView.mapper.ts
  templateFormToApi.mapper.ts
pages/
  template-detail-page.tsx
schemas/
  templateForm.schema.ts
types/
  template.types.ts
utils/
  templateValidation.ts
  templateVariables.ts
index.ts
```

Updated existing placeholder pages:

- `apps/web/src/features/templates/pages/templates-page.tsx`
- `apps/web/src/features/templates/pages/create-template-page.tsx`

Updated route/topbar files:

- `apps/web/src/app/router.tsx`
- `apps/web/src/components/layout/app-shell/nav-items.ts`
- `apps/web/src/components/layout/app-shell/topbar-action.tsx`

## Types, Constants, And Utilities

Added frontend-friendly template types in `types/template.types.ts`:

- `TemplateType`
- `TemplateCategory`
- `TemplateStatus`
- `TemplateComponentType`
- `TemplateHeaderFormat`
- `TemplateButtonType`
- `Template`
- `TemplateVariable`
- `TemplateButton`
- `TemplateComponent`
- `TemplateListFilters`
- `CreateTemplateFormValues`

Added constants in `constants/template.constants.ts`:

- Template type/category/status arrays.
- `DEFAULT_TEMPLATE_TYPE`
- `DEFAULT_LANGUAGE_CODE`
- Header/body/footer/button text limits.

Added utility foundations:

- `extractTemplateVariables(text)`
- `getVariablePositions(text)`
- `areVariablesSequential(variables)`
- `isValidTemplateName(name)`
- `isValidTemplateBody(body)`
- `isValidLanguageCode(languageCode)`

## Mock Data And API

Added `data/mockTemplates.ts` with four realistic text-template records:

- `order_confirmation_v1`
- `order_shipped_v1`
- `new_collection_offer_v1`
- `cod_confirmation_v1`

Added `api/templateApi.ts` with mock async functions:

- `getTemplates(filters)`
- `getTemplateById(id)`
- `createTemplate(payload)`
- `syncTemplates()`

These intentionally use mock data only. No backend, Prisma, Redis, Socket.IO, or Meta API integration was added.

## TanStack Query Hooks

TanStack Query is already configured in the app, so Phase 2 added hook placeholders:

- `useTemplates`
- `useTemplate`
- `useCreateTemplate`
- `useSyncTemplates`

Query keys live in `api/template.keys.ts` and follow the Phase 1 recommendation.

## Routes Added

Routes are registered in the authenticated app shell:

- `/templates`
- `/templates/create`
- `/templates/:id`

The previous `/templates/new` path is preserved as a redirect to `/templates/create` to avoid breaking existing navigation. The topbar Create Template action now points to `/templates/create`.

## Deviations And Assumptions

- Existing page filename conventions use kebab case, so the current page files remain `templates-page.tsx`, `create-template-page.tsx`, and `template-detail-page.tsx` while exporting `TemplatesListPage`, `CreateTemplatePage`, and `TemplateDetailPage`.
- Component folders use the Phase 2 requested names (`TemplateList`, `TemplateBuilder`, `TemplatePreview`) because these are feature-local and prepare for larger implementation phases.
- `templateForm.schema.ts` is intentionally a placeholder. Full Zod/React Hook Form validation is deferred to the create-template implementation phase.
- Placeholder components are intentionally minimal and presentational. They do not call APIs.
- Template types are frontend-friendly and are not treated as final Meta API or database contracts.

## Phase 3 Readiness Checklist

- [ ] Implement focused unit tests for `templateVariables.ts` and `templateValidation.ts`.
- [ ] Decide whether `/templates/:id` should show read-only detail, edit, or approval/debug information first.
- [ ] Build the Template List UI using `useTemplates`, `TemplateFilters`, `TemplateTable`, mobile cards, badges, loading, empty, and error states.
- [ ] Keep list data mocked until backend contract work is approved.
- [ ] Add section-level error boundary planning before complex preview/builder work begins.
- [ ] Start Create Template with `TEXT` only after list foundation is stable.
