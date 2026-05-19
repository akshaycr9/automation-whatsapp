# Templates Phase 12 Backend API Implementation

## Summary

Phase 12 implements authenticated backend HTTP endpoints for WhatsApp templates using the Phase 11 domain layer and Phase 10 Prisma schema. The API persists local template records only. It does not call Meta, connect the frontend, implement webhooks, or submit templates to a provider.

## Endpoints Implemented

Base route: `/api/templates`

- `GET /api/templates`: paginated, filtered, tenant-scoped template list.
- `GET /api/templates/:id`: tenant-scoped template detail with normalized components, variables, and buttons.
- `POST /api/templates`: creates a local `TEXT` template as `DRAFT`.
- `DELETE /api/templates/:id`: soft deletes a local template and writes a `DELETED` lifecycle event.
- `POST /api/templates/sync`: returns a safe placeholder response with zero counts.

Webhook handling remains deferred.

## Files Created/Modified

Created:

- `apps/api/src/modules/templates/__tests__/templates.controller.test.ts`
- `docs/templates-phase-12-backend-api-implementation.md`

Modified:

- `apps/api/src/app.ts`
- `apps/api/src/middleware/error-handler.ts`
- `apps/api/src/modules/templates/templates.controller.ts`
- `apps/api/src/modules/templates/templates.routes.ts`
- `apps/api/src/modules/templates/templates.schema.ts`
- `apps/api/src/modules/templates/services/template-domain.service.ts`
- `apps/api/src/modules/templates/domain/template.errors.ts`
- `apps/api/src/modules/templates/__tests__/templates.routes.test.ts` was replaced by controller unit coverage.

## Auth And Tenant Scoping

All `/api/templates` routes use the existing `createAuthMiddleware`.

The tenant scope is derived from `req.auth.adminUserId`, matching Phase 10's single-admin MVP scoping decision. Controllers never accept tenant ids from the request body or query string.

Repository methods continue to scope active reads and mutations by `adminUserId` and avoid id-only active template lookups.

## Create Template Flow

`POST /api/templates`:

1. Parses the request body with the template contract schema.
2. Uses the domain service and Phase 11 validators.
3. Rejects unsupported create types except `TEXT`.
4. Checks duplicate `name + languageCode` within the current admin scope.
5. Uses `TextTemplateFactory` to build normalized persistence data.
6. Persists the template with nested components, variables, buttons, and a `CREATED` event.
7. Returns the Phase 12 create envelope.

Prisma nested create is used for the create path so the local template and child records are created atomically.

## Status Behavior

Locally created templates use `DRAFT`.

This keeps Phase 12 honest: the template has not been submitted to Meta yet. Phase 13 can transition status to `SUBMITTING` and `PENDING` once provider submission is implemented or mocked.

## Error Handling Behavior

Template validation errors return:

```json
{
  "error": {
    "code": "TEMPLATE_VALIDATION_ERROR",
    "message": "Template validation failed",
    "details": []
  }
}
```

The global error handler now serializes `details` when a structured domain error provides them.

Implemented template error codes include:

- `TEMPLATE_VALIDATION_ERROR`
- `TEMPLATE_DUPLICATE_NAME`
- `TEMPLATE_NOT_FOUND`
- `TEMPLATE_UNSUPPORTED_TYPE`

Unsupported create types return `400` with `TEMPLATE_UNSUPPORTED_TYPE`.

## Sync Placeholder

`POST /api/templates/sync` does not call Meta. It returns:

```json
{
  "data": {
    "syncedCount": 0,
    "createdCount": 0,
    "updatedCount": 0,
    "failedCount": 0
  },
  "message": "Template sync is not connected to Meta yet"
}
```

## Tests And Checks

Commands run:

```sh
pnpm --filter @qw-automations/api exec vitest run src/modules/templates/__tests__
pnpm --filter @qw-automations/api typecheck
pnpm --filter @qw-automations/api lint
```

Results:

- Template tests passed: 5 files, 13 tests.
- API typecheck passed and generated Prisma Client.
- API lint passed.

Controller tests cover scoped list/detail calls, local create response shape, and sync placeholder behavior. Domain tests continue to cover validators, factory output, and mappers.

## Known Limitations

- No real Meta submission, sync, delete, provider payload storage, or webhook handling.
- No frontend API integration yet.
- No DB-backed route integration tests yet because the project does not have an established integration database test harness.
- Delete writes the soft delete and then records a lifecycle event; a future repository transaction helper can make multi-step non-create mutations fully atomic.
- Component id linking for variables/buttons remains deferred until persistence orchestration needs it.

## Phase 13 Readiness Checklist

- [ ] Add a Meta template payload builder separate from API DTOs.
- [ ] Add a Meta adapter/client with mocked tests first.
- [ ] Store provider request/response snapshots in `WhatsAppTemplateProviderPayload`.
- [ ] Transition create flow through `SUBMITTING` and `PENDING` when provider submission starts.
- [ ] Implement provider sync and status mapping.
- [ ] Keep webhook signature verification and audit persistence in a dedicated phase.
