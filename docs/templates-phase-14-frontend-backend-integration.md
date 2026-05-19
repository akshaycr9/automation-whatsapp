# Templates Phase 14 Frontend Backend Integration

## Summary

Phase 14 replaces the frontend Templates mock API implementation with real backend HTTP calls. Templates list, detail, create, sync, and delete API functions now call `/api/templates` through the shared frontend API client with the active auth token.

No frontend UI redesign, webhook handling, new template types, or database changes were added.

## Files Modified

- `apps/web/src/features/templates/api/templateApi.ts`
- `apps/web/src/features/templates/hooks/useTemplates.ts`
- `apps/web/src/features/templates/hooks/useTemplate.ts`
- `apps/web/src/features/templates/hooks/useCreateTemplate.ts`
- `apps/web/src/features/templates/hooks/useSyncTemplates.ts`
- `apps/web/src/features/templates/hooks/useDeleteTemplate.ts`
- `apps/web/src/features/templates/hooks/useCreateTemplatePageState.ts`
- `apps/web/src/features/templates/pages/templates-page.tsx`
- `apps/web/src/features/templates/pages/create-template-page.tsx`
- `apps/web/src/features/templates/components/TemplateList/TemplateListToolbar.tsx`
- `apps/web/src/features/templates/types/template.types.ts`
- `apps/web/src/features/templates/data/mockTemplates.ts`
- `apps/web/src/features/templates/index.ts`
- Template feature tests for API/query/list/create coverage.

## Endpoints Connected

- `GET /api/templates`
- `GET /api/templates/:id`
- `POST /api/templates`
- `POST /api/templates/sync`
- `DELETE /api/templates/:id`

Requests use `apiClient` with:

- `Authorization: Bearer <accessToken>`
- `credentials: "include"`

## Payload Alignment Notes

Create template payloads still come from the existing frontend mapper and remain backend-contract shaped:

- `name`
- `displayName`
- `category`
- `type: "TEXT"`
- `languageCode`
- structured `components`
- `variables` with `componentType`, `position`, `placeholder`, `sampleValue`, and optional `sourceKey`

The frontend does not build Meta payloads.

## Response Normalization

The frontend API layer unwraps backend response envelopes and maps backend detail `components.header/body/footer/buttons` into the existing frontend `TemplateComponent[]` view shape.

Quality ratings now align with backend values:

- `GREEN`
- `YELLOW`
- `RED`
- `UNKNOWN`

## Error Handling Behavior

Create errors are converted to safe user-facing messages:

- `TEMPLATE_DUPLICATE_NAME`: duplicate name/language message.
- `TEMPLATE_PROVIDER_ERROR`: safe Meta submission failure message.
- `TEMPLATE_UNSUPPORTED_TYPE`: text-only message.
- `TEMPLATE_VALIDATION_ERROR`: generic form attention message.
- `UNAUTHORIZED`: session-expired message.

Raw provider payloads and token details are never shown.

List errors continue to render `TemplateListErrorState` with retry.

## Query Invalidation Behavior

- `useCreateTemplate` invalidates template lists and seeds detail cache when an id is returned.
- `useSyncTemplates` invalidates all template queries.
- `useDeleteTemplate` invalidates template lists.
- Existing template query keys are preserved.

## Testing Notes

Automated checks run:

```sh
pnpm --filter @qw-automations/web typecheck
pnpm --filter @qw-automations/web exec vitest run src/features/templates/__tests__/template-api-query-layer.test.ts src/features/templates/__tests__/templates-list-page.test.tsx src/features/templates/__tests__/create-template-page.test.tsx
pnpm --filter @qw-automations/web lint
```

Results:

- Typecheck passed.
- Focused template frontend tests passed: 3 files, 21 tests.
- Lint passed.

## Known Limitations

- The list page still applies the existing client-side filter state after loading templates. The API layer can serialize filters, but the page state was not deeply refactored in this phase.
- Pagination metadata is normalized but no pagination UI is wired yet.
- Create now depends on backend Meta credentials because Phase 13 submits to Meta.
- Row-level sync remains a UI placeholder; the real backend sync is the list toolbar action.
- Success feedback after create currently navigates back to `/templates`; there is no toast system yet.

## Phase 15 Readiness Checklist

- [ ] Add a toast/notification system for create/sync/delete success and failure.
- [ ] Move list filtering/pagination fully to backend query params.
- [ ] Add frontend handling for provider `ERROR` template status.
- [ ] Add a tenant/store Meta credential setup screen.
- [ ] Add webhook/status refresh UX once webhook handling exists.
