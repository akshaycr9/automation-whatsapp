# Templates Phase 4 List Screen

## 1. Summary

Phase 4 implemented the `/templates` list screen using mock data and the frontend foundation from earlier phases. The screen now supports local search, status/category/language/type filters, loading/error/empty states, responsive table/card layouts, badges, and create/view navigation.

No Create Template form, backend API, database, Meta API, or Template Detail UI was implemented in this phase.

## 2. Files Created/Updated

Created:

- `apps/web/src/features/templates/components/TemplateList/TemplateListToolbar.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateTypeBadge.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateRowActions.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateListSkeleton.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateListErrorState.tsx`
- `apps/web/src/features/templates/utils/templateFilters.ts`
- `apps/web/src/features/templates/utils/templateFormatters.ts`
- `apps/web/src/features/templates/__tests__/templates-list-page.test.tsx`

Updated:

- `apps/web/src/features/templates/pages/templates-page.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateListHeader.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateFilters.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateTable.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateStatusBadge.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateCategoryBadge.tsx`
- `apps/web/src/features/templates/components/TemplateList/EmptyTemplatesState.tsx`
- `apps/web/src/features/templates/data/mockTemplates.ts`
- `apps/web/src/features/templates/types/template.types.ts`

## 3. Component Breakdown

`TemplatesListPage`

- Container for `/templates`.
- Owns local filter state.
- Uses `useTemplates()` for mock TanStack Query data.
- Computes filtered/sorted records and status counts.
- Handles create/view navigation and placeholder row actions.

`TemplateListHeader`

- Displays page title, count summary, and Create Template CTA.

`TemplateListToolbar`

- Displays status quick filters and mock sync action.

`TemplateFilters`

- Controlled search, status, category, language, and type filters.
- Provides reset behavior.

`TemplateTable`

- Presentational desktop table and mobile card list.
- Receives data and action callbacks from the page.

`TemplateStatusBadge`, `TemplateCategoryBadge`, `TemplateTypeBadge`

- Isolated display formatting and visual badge treatment.

`TemplateListSkeleton`, `TemplateListErrorState`, `EmptyTemplatesState`

- Dedicated loading, error, and empty states.

## 4. Mock Data

The list uses `features/templates/data/mockTemplates.ts` with realistic text template records:

- `order_confirmation_v1`
- `order_shipped_v1`
- `cod_confirmation_v1`
- `new_collection_offer_v1`
- `abandoned_cart_reminder_v1`
- `delivery_update_v1`

Statuses include `APPROVED`, `PENDING`, `REJECTED`, `DRAFT`, and `PAUSED`.

## 5. Filtering And Sorting

Filtering is local over mock data for now.

Supported filters:

- Case-insensitive search across name, display name, category, language, type, and status.
- Status filter.
- Category filter.
- Language filter.
- Type filter.

Default sorting is `updatedAt` descending.

## 6. Error Boundary Usage

The route is already protected by route and feature boundaries from Phase 3. Phase 4 keeps section-level protection around:

- Template filters/toolbar section.
- Template list table/card section.

Backend/API errors are represented as TanStack Query error states, not render error boundaries.

## 7. TanStack Query And Mock API

`TemplatesListPage` uses `useTemplates()`, which calls the existing mock `templateApi.getTemplates()`.

The query key structure remains future-ready:

```ts
templateKeys.list(filters);
```

For this phase, page-level client filtering is used so the UI can derive all filter options and counts from the full mock dataset.

## 8. Accessibility Notes

- Search input has a visible label and `aria-label`.
- Filter controls use labels tied to select inputs.
- Desktop list uses semantic table markup and a screen-reader caption.
- Mobile layout uses article cards.
- Actions are keyboard-accessible buttons with clear text labels.
- Empty and error states use readable text and actionable buttons.

## 9. Known Limitations

- Edit, duplicate, and delete are placeholders and do not mutate data.
- Sync is mock-only and invalidates the mock query.
- No real pagination yet.
- No Template Detail UI yet; View navigates to the existing placeholder route.
- No Create Template form yet.

## 10. Phase 5 Readiness Checklist

- [ ] Implement the Create Template form for `TEXT` templates only.
- [ ] Add React Hook Form + Zod validation from the planned schema.
- [ ] Use variable extraction utilities for body sample values.
- [ ] Keep submit/save actions mock-only until backend contracts are approved.
- [ ] Wrap builder, preview, variable mapping, and button editor sections with `SectionErrorBoundary`.
