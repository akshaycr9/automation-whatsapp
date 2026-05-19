# Templates Phase 8 API Query Layer

## Summary

Phase 8 cleaned the Templates frontend API abstraction and TanStack Query hooks while keeping mock data and existing UI behavior intact.

No backend API, database, Meta API, or real network integration was added.

## Files Created

- `apps/web/src/features/templates/hooks/templateKeys.ts`
- `apps/web/src/features/templates/__tests__/template-api-query-layer.test.ts`
- `docs/templates-phase-8-api-query-layer.md`

## Files Modified

- `apps/web/src/features/templates/api/templateApi.ts`
- `apps/web/src/features/templates/api/template.keys.ts`
- `apps/web/src/features/templates/hooks/useTemplates.ts`
- `apps/web/src/features/templates/hooks/useTemplate.ts`
- `apps/web/src/features/templates/hooks/useCreateTemplate.ts`
- `apps/web/src/features/templates/hooks/useSyncTemplates.ts`
- `apps/web/src/features/templates/index.ts`

## API Functions

`templateApi` now exposes Promise-based response envelopes:

- `getTemplates(filters?)`
- `getTemplateById(id)`
- `createTemplate(payload)`
- `syncTemplates()`

The API still reads from `mockTemplates`. It returns backend-like envelopes such as `{ data, pagination }` or `{ data, message }`.

## Query Keys

Stable keys live in `hooks/templateKeys.ts`:

```ts
templateKeys.all;
templateKeys.lists();
templateKeys.list(filters);
templateKeys.details();
templateKeys.detail(id);
```

`api/template.keys.ts` re-exports the hook key module for compatibility.

## Hooks

TanStack Query is used because it is already configured in the app.

- `useTemplates(filters)` unwraps `response.data`.
- `useTemplate(id)` unwraps `response.data` and is enabled only when an id exists.
- `useCreateTemplate()` uses a mutation and invalidates list queries.
- `useSyncTemplates()` uses a mutation and invalidates template queries.

## Page Consumption

The Templates List page continues to consume `useTemplates()` and receives `Template[]`, so search/filter/list UI behavior remains unchanged.

The Create Template flow continues to use `useCreateTemplate()` through the existing page state hook. Submit remains mock-only and validation-gated.

## Backend Integration Notes

When backend endpoints exist, replace the mock internals of `templateApi` with HTTP calls while preserving:

- response envelope shapes,
- hook return behavior,
- query key structure,
- normalized create payloads.

## Phase 9 Readiness Checklist

- [ ] Define backend template API contract.
- [ ] Replace mock `templateApi` internals with HTTP client calls.
- [ ] Add server error mapping for field and global errors.
- [ ] Add pagination support if the backend returns paginated lists.
- [ ] Add optimistic/update behavior only after API semantics are known.
