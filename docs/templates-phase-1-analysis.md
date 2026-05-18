# Templates Phase 1 Analysis & Frontend Plan

## 1. Summary

The provided prototype contains two screens in one JSX file:

- `TemplatesScreen`: a WhatsApp template list with status tabs, category filtering, search, desktop table, mobile cards, per-row sync action, duplicate/delete actions, and an empty state.
- `CreateTemplateScreen`: a create-template flow with basic details, header editor, body editor, variable sample values, footer editor, button editor, WhatsApp-style live preview, and submit/save/cancel actions.

The prototype is useful as a product and interaction reference, but it is not production-ready. It relies on local mock state, inline styles, browser globals, hardcoded mock data/constants, prototype-only CSS, and component definitions nested inside screen components. It should be converted into typed, modular React components that fit the current Vite/React/Tailwind app structure.

Phase 1 should stop at planning. Phase 2 can implement a frontend-only, mock-data version of the Templates feature without backend routes, Prisma changes, Meta API calls, Redis jobs, or real external integrations.

## 2. Existing App Structure Observations

The frontend lives in `apps/web` and already follows a feature-folder layout:

```text
apps/web/src/
  app/
  components/
    layout/
    ui/
  features/
    auth/
    automations/
    conversations/
    dashboard/
    logs/
    settings/
    templates/
  lib/
  styles/
  test/
```

Routing is centralized in `apps/web/src/app/router.tsx` using `createBrowserRouter` from React Router. Authenticated routes are wrapped in `ProtectedRoute` and rendered inside `AppShell`. Templates routes already exist:

- `/templates` -> `TemplatesPage`
- `/templates/new` -> `CreateTemplatePage`

The app shell in `apps/web/src/components/layout/app-shell.tsx` owns the sidebar, mobile nav, topbar, route title/subtitle, and secondary route back actions. `secondaryRouteMeta` already includes metadata for `/templates/new`, so the create screen should rely on the shell for the page title and back affordance.

Styling uses Tailwind CSS v4 with design tokens in `apps/web/src/styles/index.css`. Existing tokens map to Tailwind theme names such as `bg-background`, `bg-surface`, `text-text`, `text-text-muted`, `border-border`, `bg-brand`, `bg-brand-soft`, and `shadow-sm`. The prototype CSS uses nearly the same visual token model, but with different token names such as `--bg`, `--text-2`, `--radius`, and `--shadow`.

Reusable UI primitives currently include:

- `Button`
- `Input`
- `Badge`
- `Card`

These are intentionally small. The Templates implementation should build on them and add missing local components only when useful, such as `SelectField`, `TextareaField`, `EmptyState`, `Tabs`, and template-specific badges.

TanStack Query is already configured in `apps/web/src/app/providers.tsx` and `apps/web/src/app/query-client.ts`. Auth already uses query/mutation hooks in `apps/web/src/features/auth/hooks`, so Templates should follow that pattern when mock hooks and later API hooks are introduced.

Current Templates pages are placeholders only:

- `apps/web/src/features/templates/pages/templates-page.tsx`
- `apps/web/src/features/templates/pages/create-template-page.tsx`

The shared package has a minimal template type and categories:

- `packages/shared/src/types/template.ts`
- `packages/shared/src/constants/template-categories.ts`

Those shared types are too small for the planned UI but can be extended later during the approved shared-contract phase. Until then, frontend-local types should model the mock UI state without pretending to be final Meta or database payloads.

## 3. Prototype File Analysis

### `templates.jsx`

`TemplatesScreen` contains the Template List screen. Main UI blocks:

- Status tabs/dropdown: `All`, `Approved`, `Pending`, `Rejected`, `Draft`.
- Category filter: `All`, `Utility`, `Marketing`, `Authentication`.
- Search input.
- Empty state with Create Template CTA.
- Desktop table with template name, category, language, status, sync, created date, actions.
- Mobile card list equivalent of the table.
- Per-row sync state using `syncing` object and `setTimeout`.

`CreateTemplateScreen` contains the Create Template screen. Main UI blocks:

- Template basics card: name, category, language, header type.
- Header text editor and prototype image upload placeholder.
- Body card: body textarea, detected variables, sample values, footer.
- Buttons card: mode selector, quick reply builder, CTA builder.
- Action footer: cancel, save draft, submit for review.
- Sticky live preview panel with WhatsApp bubble, variable substitution, footer, timestamp, buttons, and review info card.

Hardcoded data and behavior that should be extracted:

- `TEMPLATES`, `LANGS`, status/category option lists, sample default form values.
- Category color map.
- Status badge behavior.
- Sync simulation timing.
- Text samples, footer copy, CTA sample URL, preview timestamp.
- WhatsApp button constraints.
- Variable parsing logic.
- Header/body/footer character limits.

Repeated or reusable sections:

- Select/dropdown rendering.
- Field label/help/error pattern.
- Status/category badges.
- Empty state.
- Desktop table plus mobile card representation.
- Icon-only action buttons.
- Button mode segmented selector.
- Repeatable button row editor.
- WhatsApp preview bubble/buttons.

The prototype nests helper components such as `DropdownSelect`, `CategoryFilter`, and `BtnModeBtn` inside screens. Production code should move those into files with clear responsibilities or replace them with shared UI primitives.

### `styles.css`

The stylesheet includes a full prototype design system, layout shell, dashboard, conversations, template preview, mobile viewport emulator, utility classes, and many unrelated styles. In production, these styles should not be copied wholesale.

Reusable ideas:

- Status/category badge color semantics.
- Table density and mobile card fallback.
- WhatsApp preview visual treatment.
- Empty state pattern.
- Form field spacing and help text.
- Sticky preview on larger viewports.

Prototype-specific styles:

- `body[data-viewport="mobile"]` mobile device emulator.
- Prototype shell classes such as `.app-shell`, `.sidebar`, `.topbar`, `.content`, `.mobile-bottom-nav`.
- Broad utility classes like `.h-stack`, `.v-stack`, `.sp-between` if they duplicate Tailwind.
- Dashboard, conversations, charts, logs, settings styles unrelated to Templates.
- Global icon globals from `icons.jsx`.

Recommended styling approach: use the existing Tailwind v4 token system and current UI primitives. Add small component-level Tailwind class compositions in TSX. If WhatsApp preview styling becomes too verbose, create a tiny feature stylesheet only for preview-specific selectors, but prefer Tailwind first.

### `icons.jsx`

The icon file defines a prototype global icon registry. Production should not use `window.I` or copy the registry. The app currently uses inline SVGs in a few places. For Templates, prefer existing icon conventions; if the project later standardizes on an icon package, do that at the app level rather than for this feature only. Avoid adding an icon dependency in Phase 2 unless explicitly approved.

## 4. Proposed Feature Folder Structure

Adapt the implementation to the existing `apps/web/src/features/templates` folder:

```text
apps/web/src/features/templates/
  __tests__/
    create-template-page.test.tsx
    templates-page.test.tsx
    template-variables.test.ts
  api/
    template.api.ts
    template.keys.ts
  components/
    create/
      ButtonEditor.tsx
      HeaderEditor.tsx
      TemplateBasicsFields.tsx
      TemplateBuilder.tsx
      TemplateFooterField.tsx
      TemplatePreview.tsx
      TemplateSubmitActions.tsx
      VariableSamplesPanel.tsx
      ValidationChecklist.tsx
    list/
      TemplateFilters.tsx
      TemplateListEmptyState.tsx
      TemplateMobileCardList.tsx
      TemplateStatusTabs.tsx
      TemplateTable.tsx
      TemplatesToolbar.tsx
    shared/
      TemplateCategoryBadge.tsx
      TemplateStatusBadge.tsx
      TemplateTypeBadge.tsx
  hooks/
    use-create-template.ts
    use-template-form.ts
    use-template-preview.ts
    use-templates.ts
    use-sync-template.ts
  mappers/
    template-form-to-api.mapper.ts
  mocks/
    template-mocks.ts
  pages/
    create-template-page.tsx
    templates-page.tsx
  schemas/
    template-form.schema.ts
  types/
    template.types.ts
  utils/
    template-buttons.ts
    template-variables.ts
```

Notes:

- Keep page files as route containers.
- Keep fetching/mutations in hooks.
- Keep visual rendering in components.
- Keep validation in `schemas`.
- Keep mock records in `mocks`.
- Keep conversion to future backend/API shapes in `mappers`, not inside form JSX.

## 5. Component Breakdown

`TemplatesPage`

- Responsibility: Route container for `/templates`; owns filter state initially, calls `useTemplates`, and passes data into list components.
- Type: Container.
- Props: none.
- Hooks: `useTemplates`, navigation.
- Future boundary: route-level and feature-level.

`TemplatesToolbar`

- Responsibility: Render status tabs/dropdown, category/language filters, search, and create CTA if not provided by topbar.
- Type: Presentational with controlled values.
- Props: `filters`, `counts`, `onFiltersChange`, `onCreate`.
- Hooks: none.
- Future boundary: no dedicated boundary unless filter UI becomes complex.

`TemplateStatusTabs`

- Responsibility: Desktop status filter tabs and mobile status select.
- Type: Presentational.
- Props: `value`, `items`, `onChange`.
- Hooks: none.

`TemplateFilters`

- Responsibility: Category, language, and eventually type filters.
- Type: Presentational.
- Props: `filters`, `options`, `onChange`.
- Hooks: none.

`TemplateTable`

- Responsibility: Render desktop list of template records.
- Type: Presentational.
- Props: `templates`, `isLoading`, `error`, `onSync`, `onDuplicate`, `onDelete`, `onView`.
- Hooks: none.
- Future boundary: section-level boundary because table rendering, actions, and later pagination/sorting can fail independently.

`TemplateMobileCardList`

- Responsibility: Render mobile card equivalent of the table.
- Type: Presentational.
- Props: same action/data props as `TemplateTable`.
- Hooks: none.
- Future boundary: can share the same list section boundary as `TemplateTable`.

`TemplateListEmptyState`

- Responsibility: Render empty state for no templates or no filter results.
- Type: Presentational.
- Props: `reason`, `onCreate`, optional `onClearFilters`.
- Hooks: none.

`TemplateStatusBadge`, `TemplateCategoryBadge`, `TemplateTypeBadge`

- Responsibility: Normalize display labels and colors for status/category/type.
- Type: Presentational.
- Props: `status`, `category`, or `type`.
- Hooks: none.

`CreateTemplatePage`

- Responsibility: Route container for `/templates/new`; initializes form, handles mock submit, coordinates builder and preview.
- Type: Container.
- Hooks: `useTemplateForm`, later `useCreateTemplate`.
- Future boundary: route-level and feature-level.

`TemplateBuilder`

- Responsibility: Compose form sections for the active template type.
- Type: Container/presenter hybrid for Phase 2; should receive form methods from the page or a local hook.
- Props: form methods, active template type, validation state.
- Hooks: React Hook Form context if using `FormProvider`.
- Future boundary: feature section boundary.

`TemplateBasicsFields`

- Responsibility: Template name, display name if added, category, language, type.
- Type: Presentational form section.
- Props: form registration/control and error state.
- Hooks: ideally none except React Hook Form helpers if standardized.

`HeaderEditor`

- Responsibility: Header type and type-specific fields. In Phase 2, only `None` and `Text` should be active if MVP is text-only; media placeholders can be disabled or hidden.
- Type: Presentational.
- Props: `headerType`, field bindings, limits.
- Future boundary: section-level later when media upload is introduced.

`BodyEditor`

- Responsibility: Body textarea and help text.
- Type: Presentational.
- Props: body binding, max length, validation messages.
- Future boundary: section-level if rich editing/variable insertion is added.

`VariableSamplesPanel`

- Responsibility: Render detected variables and sample value inputs.
- Type: Presentational.
- Props: `variables`, `sampleValues`, `onSampleValueChange`, errors.
- Hooks: none.
- Future boundary: section-level boundary because parsing and mapping can become complex.

`TemplateFooterField`

- Responsibility: Optional footer input and character count.
- Type: Presentational.
- Props: value binding, limit, errors.

`ButtonEditor`

- Responsibility: Button mode selection, quick replies, CTA buttons, constraints.
- Type: Presentational with controlled data, or container if using `useFieldArray`.
- Props: button config, errors, action callbacks.
- Future boundary: section-level boundary.

`TemplatePreview`

- Responsibility: Render WhatsApp-style live preview from form values and derived sample values.
- Type: Presentational.
- Props: preview model, active template type.
- Hooks: none.
- Future boundary: section-level boundary. Preview should fail gracefully without losing the form.

`ValidationChecklist`

- Responsibility: Show human-readable validation readiness for submit/review.
- Type: Presentational.
- Props: checklist items derived from schema/form state.
- Future boundary: section-level if rules grow.

`TemplateSubmitActions`

- Responsibility: Cancel, save draft, submit for review.
- Type: Presentational.
- Props: `isSubmitting`, `canSubmit`, `onCancel`, submit button labels.

## 6. Frontend State Plan

Local UI state:

- Search query.
- Selected list filters before they become URL params.
- Mobile-only open/closed UI state if needed.
- Button editor UI affordances.
- Preview collapsed/open state on mobile, if introduced.

Form state:

- Template name.
- Optional display name.
- Category.
- Language.
- Template type, default `TEXT`.
- Header configuration.
- Body text.
- Footer text.
- Button mode and button details.
- Variable sample values.

Use React Hook Form for create/edit form state and Zod for validation. Keep validation schemas outside JSX in `schemas/template-form.schema.ts`.

Server state later via TanStack Query:

- Template list.
- Template detail.
- Create template mutation.
- Sync template mutation.
- Delete/duplicate mutations if approved later.

Derived state:

- Detected variables from body/header/button URLs.
- Sequential variable validity.
- Preview render model.
- Validation checklist state.
- Status/category counts from the template list.

Mock data initially:

- Template records for all key statuses/categories.
- Language option list.
- Category/status/type option lists.
- Mock create response.
- Mock sync response.

Do not put mock records inline in page components. Use `mocks/template-mocks.ts`, then later swap hook internals to `template.api.ts` without changing presentational components.

## 7. Validation Planning

Do not implement validation in Phase 1. Phase 2 should define a Zod schema with at least:

- Template name is required.
- Template name accepts lowercase letters, numbers, and underscores only.
- Category is required.
- Language is required.
- Template type is required and defaults to `TEXT`.
- Body is required.
- Body max length follows WhatsApp template constraints.
- Header text max length, when present.
- Footer max length, when present.
- Variables use `{{1}}`, `{{2}}`, etc.
- Variables are sequential with no gaps.
- Every detected variable has a non-empty sample value.
- Quick reply labels are required when quick replies are enabled.
- Quick replies are limited to 3.
- CTA buttons are limited to 2.
- CTA button labels are required.
- CTA URL values are valid URLs when type is URL.
- CTA phone values are valid enough for frontend guidance when type is phone.
- URL variables also require sample values if later supported.

Validation should produce field-level errors and checklist-friendly derived messages. JSX components should receive validation state, not define rules inline.

## 8. Future Template Type Extensibility

Phase 2 should implement `TEXT` only, but the form model should leave room for future types:

```ts
const templateFormRegistry = {
  TEXT: TextTemplateForm,
  MEDIA: MediaTemplateForm,
  CAROUSEL: CarouselTemplateForm,
  AUTHENTICATION: AuthenticationTemplateForm
};
```

Recommended model direction:

- A base template form shape for shared fields: name, category, language, type.
- A type-specific `content` object for header/body/footer/buttons/media/carousel/auth fields.
- UI components that consume app-level template form types, not raw Meta payloads.
- A mapper layer to convert frontend form values into future backend DTOs.

Future risk points:

- Media templates will need upload/sample asset UI and stricter preview dimensions.
- Carousel templates need repeated card state and nested buttons.
- Authentication templates have special fixed-copy and OTP/autofill constraints.
- Button rules differ by type and can quickly become too complex for inline conditionals.
- Preview rendering should be type-driven, not one large component full of `if` blocks.

## 9. Error Boundary Recommendations

Implement error boundaries in a future app-wide phase, not during Phase 1.

Recommended placement:

- App-level boundary around `AppProviders`/`AppRouter` to catch unrecoverable render errors and show a full-page fallback.
- Layout-level boundary inside or around `AppShell` so sidebar/topbar/layout failures show an authenticated-shell fallback.
- Route-level boundaries using React Router route `errorElement` for `/dashboard`, `/templates`, `/templates/new`, and other routes.
- Templates feature-level boundary around the Templates route content so list/create failures are isolated from the shell.
- Section-level boundaries around complex Templates sections:
  - `TemplateTable`
  - `TemplateBuilder`
  - `TemplatePreview`
  - `VariableSamplesPanel`
  - `ButtonEditor`
  - future media upload/sample picker
  - future carousel card builder

Fallback UI behavior:

- App-level: clear message, reload action, optional sign-out if auth state is suspect.
- Layout-level: keep a minimal top-level fallback with navigation back to dashboard.
- Route-level: show route title, failure message, retry action, and back action.
- Feature-level: keep page chrome and show a feature-specific recovery panel.
- Section-level: show an inline card with "This section could not be displayed" and a retry/reset action when possible.

Error boundaries should complement, not replace, normal loading/empty/error states from TanStack Query.

## 10. TanStack Query Preparation

Future query key factory:

```ts
export const templateKeys = {
  all: ["templates"] as const,
  lists: () => [...templateKeys.all, "list"] as const,
  list: (filters: TemplateListFilters) => [...templateKeys.lists(), filters] as const,
  details: () => [...templateKeys.all, "detail"] as const,
  detail: (id: string) => [...templateKeys.details(), id] as const
};
```

Future hooks:

- `useTemplates(filters)`: returns list data, loading, error, refetch.
- `useTemplate(id)`: returns one template detail.
- `useCreateTemplate()`: mock submit first, later backend mutation.
- `useSyncTemplate()`: mock sync first, later backend mutation.

Initial mock implementation can use query hooks with local mock promises so page/container code is already shaped like production. Do not connect to backend until the backend/API phase is approved.

## 11. Mock Data Plan

Use typed mock records covering:

- Approved utility text template, e.g. `shipping_update_v1`.
- Pending marketing text template, e.g. `new_arrival_announcement`.
- Rejected marketing text template with a rejection reason.
- Draft utility text template.
- Authentication template placeholder record for list filtering only, not create support.
- Multiple languages such as `en_US`, `en_GB`, and `hi_IN`.
- Different sync states such as never synced, recently synced, stale.

Suggested frontend record fields:

```ts
type TemplateListItem = {
  id: string;
  name: string;
  displayName?: string;
  category: "utility" | "marketing" | "authentication";
  language: string;
  type: "TEXT" | "MEDIA" | "CAROUSEL" | "AUTHENTICATION";
  status: "approved" | "pending" | "rejected" | "draft";
  createdAt: string;
  updatedAt?: string;
  lastSyncedAt?: string | null;
  rejectionReason?: string;
};
```

Keep this as a frontend planning type initially. Do not treat it as the final database or Meta API schema.

## 12. Risks & Recommendations

Prototype structure risk: both screens are in one file with nested helper components and inline styles. Split into route containers, presentational components, hooks, schemas, utils, and mocks.

CSS maintainability risk: copying the prototype stylesheet would duplicate the app shell and design tokens. Use the existing Tailwind token system and current `components/ui` primitives.

Responsiveness risk: the prototype uses a viewport emulator and `body[data-viewport="mobile"]`. Production should use responsive Tailwind classes and real browser breakpoints. Tables must become cards on mobile.

Over-coupling risk: avoid binding the UI directly to Meta payload shape. Use frontend form types plus mapper functions.

Form complexity risk: variable parsing, sample values, buttons, and future template types will become hard to manage with scattered `useState`. Use React Hook Form and isolate derived state in utilities/hooks.

Future type risk: media, carousel, and authentication templates can break a text-only form if `TemplateBuilder` is not type-driven. Introduce a registry or equivalent type-specific composition point early.

Error handling risk: no error boundaries are currently visible in the frontend structure. Add them in a dedicated future phase across app, layout, routes, features, and complex sections.

Routing risk: create route exists, but detail/edit routes do not. Before adding detail/edit screens, define route names and topbar metadata deliberately.

Accessibility risk: prototype icon-only buttons need accessible names, status tabs need correct tab/select semantics, form inputs need labels and error descriptions, and preview controls should not masquerade as real sendable WhatsApp buttons if they are not interactive.

Design consistency risk: the prototype visually aligns with the app tokens, but it uses custom globals and slightly different variable names. Production should look like the existing authenticated dashboard shell, not the standalone prototype shell.

## 13. Phase 2 Readiness Checklist

- [ ] Confirm Phase 2 scope is frontend-only mock Templates list and create flow.
- [ ] Confirm `TEXT` is the only creatable template type in Phase 2.
- [ ] Decide whether non-text types appear disabled in the create UI or are hidden until later.
- [ ] Confirm route set: `/templates`, `/templates/new`, and whether `/templates/:id` is deferred.
- [ ] Define frontend-local template types in `features/templates/types`.
- [ ] Define mock records and mock service behavior.
- [ ] Define Zod schema and form defaults.
- [ ] Define variable parser utility behavior and tests.
- [ ] Decide whether list filters should stay local state or sync to URL search params.
- [ ] Decide which actions are mock-only in Phase 2: create, save draft, sync, duplicate, delete.
- [ ] Confirm no backend APIs, Prisma models, migrations, Redis jobs, Socket.IO work, or Meta calls are part of Phase 2.
- [ ] Add focused tests for list rendering, empty/filter states, form validation, variable parsing, and preview rendering.
- [ ] Plan a later app-wide error boundary phase before the Templates feature grows into media/carousel builders.
