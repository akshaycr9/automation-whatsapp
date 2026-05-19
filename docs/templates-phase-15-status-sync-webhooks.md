# Templates Phase 15: Status Sync and Webhooks

## Summary

Phase 15 keeps local WhatsApp template lifecycle fields aligned with Meta through improved manual sync and a Meta template status webhook endpoint.

## Files created/modified

Created:

- `apps/api/src/modules/webhooks/meta-webhook-signature.ts`
- `apps/api/src/modules/webhooks/__tests__/webhooks.service.test.ts`
- `docs/templates-phase-15-status-sync-webhooks.md`

Modified:

- `.env.example`
- `apps/api/src/app.ts`
- `apps/api/src/config/env.ts`
- `apps/api/src/modules/templates/providers/meta/meta-template.mapper.ts`
- `apps/api/src/modules/templates/repositories/template.repository.ts`
- `apps/api/src/modules/templates/services/template-domain.service.ts`
- `apps/api/src/modules/templates/__tests__/templates.service.test.ts`
- `apps/api/src/modules/webhooks/webhooks.controller.ts`
- `apps/api/src/modules/webhooks/webhooks.routes.ts`
- `apps/api/src/modules/webhooks/webhooks.service.ts`

## Manual sync behavior

`POST /api/templates/sync` remains admin-authenticated and tenant-scoped through the current auth context. It calls Meta list templates, matches local templates by `metaTemplateId` first and by `name + languageCode` otherwise, then creates or updates local records.

Meta remains source of truth for provider-owned fields:

- `status`
- `qualityRating`
- `rejectionReason`
- `category`
- `languageCode`
- `metaTemplateId`
- `wabaId`
- `lastSyncedAt`

The sync stores a provider payload record with action `SYNC`, creates a summary `SYNCED` event, creates per-template `SYNCED` events, and creates lifecycle events such as `APPROVED`, `REJECTED`, `PAUSED`, or `DISABLED` when status changes. The response returns `syncedCount`, `createdCount`, `updatedCount`, and `failedCount`.

## Webhook endpoint

The webhook endpoint is:

`POST /api/webhooks/meta/template-status`

It does not use normal admin authentication. It verifies the Meta webhook signature, extracts template status events from `entry[].changes[]`, and identifies templates by `metaTemplateId` where available. If no provider id is present, it falls back to `name + languageCode + wabaId` when those fields are present.

For matched templates, it updates status, quality rating, rejection reason, and `lastSyncedAt`. It stores the raw event fragment as provider payload action `WEBHOOK`, creates `WEBHOOK_RECEIVED`, and creates a lifecycle event when the status changed.

Unmatched events are still audited in provider payloads with a safe error code/message.

## Signature verification approach

`verifyMetaWebhookSignature(req)` validates `x-hub-signature-256` using HMAC SHA256 over the raw request body and `META_APP_SECRET`. Comparisons use `timingSafeEqual`.

Raw body capture is wired through the global JSON parser `verify` callback in `apps/api/src/app.ts`.

Configuration:

- `META_APP_SECRET` is required for verification.
- `META_WEBHOOK_VERIFY_DISABLED=true` can bypass verification in non-production only.
- Production fails closed if the app secret or valid signature is missing.

## Status mapping

Meta statuses are normalized through `mapMetaTemplateStatus`:

- `APPROVED` -> `APPROVED`
- `PENDING` -> `PENDING`
- `REJECTED` -> `REJECTED`
- `PAUSED` -> `PAUSED`
- `DISABLED` -> `DISABLED`
- unknown statuses keep existing local status during webhook processing and are recorded in event metadata with an `ERROR` event

## Provider payload and event audit behavior

Manual sync uses provider payload action `SYNC`.

Webhook handling uses provider payload action `WEBHOOK`.

Template events record:

- `WEBHOOK_RECEIVED` for matched webhook events
- `SYNCED` for manual sync updates
- lifecycle transitions when status changes
- `ERROR` for unknown webhook statuses

Duplicate/status-idempotent webhook updates do not create repeated lifecycle transition events when the status is unchanged.

## Frontend sync behavior

The existing Templates list already uses `useSyncTemplates`. The sync button calls `POST /api/templates/sync`, shows pending state through `isSyncing`, and invalidates template queries on success. No raw Meta payloads or provider errors are exposed to the frontend.

No realtime sockets or background polling were added. Query invalidation after create/sync remains the refresh strategy for Phase 15.

## Testing and manual testing notes

Automated coverage added:

- manual sync updates a changed status and creates lifecycle events
- webhook updates template status
- webhook creates `WEBHOOK_RECEIVED`
- unknown Meta status does not crash or overwrite local status
- unchanged webhook status avoids duplicate lifecycle transition events
- unmatched webhook events are audited

Manual webhook testing can use `META_WEBHOOK_VERIFY_DISABLED=true` only in local development. Production-like testing should sign the raw JSON body with `META_APP_SECRET` and send the digest as `x-hub-signature-256: sha256=<hex>`.

## Known limitations

- There is no dedicated webhook event table yet, so provider payload audit records are used for webhook payload storage.
- Idempotency is status-safe, but there is no persistent webhook delivery id/hash dedupe without a schema addition.
- Webhook parsing is intentionally scoped to template status-style changes and ignores unrelated Meta webhook types.
- Tenant inference for webhooks depends on provider identity and `wabaId` when Meta includes it.

## Phase 16 readiness checklist

- Decide whether a dedicated webhook event table is needed for delivery-level dedupe.
- Add webhook verification-token GET flow if Meta subscription setup is automated through this app.
- Add admin-visible audit/log views only after a product plan is approved.
- Keep realtime refresh/socket work out of scope until the planned conversations or operations phases.
