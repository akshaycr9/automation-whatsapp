# Templates Feature Summary

## Supported in v1

Templates v1 supports TEXT WhatsApp template workflows for a single authenticated admin/store owner:

- List templates from the backend.
- View template detail.
- Create TEXT templates with optional text header, required body, optional footer, and supported buttons.
- Supported button types: `QUICK_REPLY`, `URL`, `PHONE_NUMBER`.
- Detect numbered body variables such as `{{1}}` and `{{2}}`.
- Require sample values for all detected variables.
- Submit templates to Meta through the backend adapter.
- Sync template status from Meta manually.
- Receive Meta template status webhooks.
- Soft-delete local template records.

## Not Yet Supported

- Media templates.
- Carousel templates.
- Authentication templates.
- Media headers.
- Copy-code buttons.
- Flow buttons.
- Broadcasts, automation builder behavior, Redis jobs, and WhatsApp send jobs.

## API Endpoints

Authenticated template endpoints:

- `GET /api/templates`
- `GET /api/templates/:id`
- `POST /api/templates`
- `POST /api/templates/sync`
- `POST /api/templates/:id/sync`
- `POST /api/templates/:id/retry-submission`
- `DELETE /api/templates/:id`

Meta webhook endpoints:

- `GET /webhooks/meta`
- `POST /webhooks/meta`
- `GET /api/webhooks/meta`
- `POST /api/webhooks/meta`

Template endpoints return normalized DTOs and do not expose raw Meta response shapes.

## Frontend Screens

- Templates list page with backend loading, empty, error, search, filters, badges, row actions, and sync action.
- Create template page with type-aware form state, TEXT-only submit readiness, variable samples, preview replacement, safe provider errors, and success navigation back to the list.
- Template detail page for backend-backed template detail display and row-level actions where available.

## Meta Sync and Webhook Behavior

- Create submits a Meta-compatible TEXT payload through `MetaTemplateAdapter`.
- Provider request and response payloads are stored in `WhatsAppTemplateProviderPayload` audit records.
- Successful create updates local provider id, status, and `lastSyncedAt`.
- Failed create leaves the local template in `ERROR` and records provider diagnostics internally.
- Manual sync lists templates from Meta, matches by `metaTemplateId` or `name + languageCode`, and creates/updates local records within the authenticated admin scope.
- Webhooks do not use admin auth. They verify `x-hub-signature-256` with `META_APP_SECRET` over the raw request body.
- Unknown Meta statuses are recorded without crashing or overwriting the existing local status.
- Duplicate webhook status updates do not create repeated lifecycle transition events when the status is unchanged.

## Important Environment Variables

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `WEB_APP_URL`
- `API_URL`
- `META_GRAPH_API_VERSION`
- `META_WABA_ID`
- `META_ACCESS_TOKEN`
- `META_APP_SECRET`
- `META_VERIFY_TOKEN`
- `META_WEBHOOK_VERIFY_DISABLED` for local development only; ignored in production.

## Operational Notes

- Templates v1 is scoped to one admin/store owner and uses admin-user scoping for tenant isolation.
- Keep provider payload audit records internal because they may contain raw provider responses.
- Do not log authorization headers or access tokens.
- Configure Meta webhook callback verification with `META_VERIFY_TOKEN`.
- Use signed webhook requests in staging and production-like testing.
- Backend pagination exists; frontend pagination controls can be added later without changing the API contract.
- Do not add unsupported template types until their product and backend plans are approved.
