# Templates Phase 13 Meta Adapter

## Summary

Phase 13 adds a provider adapter layer for Meta WhatsApp Template APIs and integrates it into template create and sync flows. Controllers remain provider-agnostic. The backend now builds Meta-compatible TEXT template payloads, submits creates through an adapter, syncs template summaries from Meta, stores provider payload audit rows, and normalizes provider errors.

Frontend integration, webhooks, media templates, carousel templates, and tenant-specific credential storage remain deferred.

## Files Created/Modified

Created:

- `apps/api/src/modules/templates/providers/template-provider.adapter.ts`
- `apps/api/src/modules/templates/providers/meta/meta-template.adapter.ts`
- `apps/api/src/modules/templates/providers/meta/meta-template.mapper.ts`
- `apps/api/src/modules/templates/providers/meta/meta-template.types.ts`
- `apps/api/src/modules/templates/providers/meta/meta-template.errors.ts`
- `apps/api/src/modules/templates/providers/meta/meta-template-credentials.ts`
- `apps/api/src/modules/templates/__tests__/meta-template.mapper.test.ts`
- `apps/api/src/modules/templates/__tests__/meta-template.adapter.test.ts`
- `apps/api/src/modules/templates/__tests__/template-domain.service-provider.test.ts`

Modified:

- `apps/api/src/config/env.ts`
- `apps/api/src/modules/templates/index.ts`
- `apps/api/src/modules/templates/repositories/template.repository.ts`
- `apps/api/src/modules/templates/services/template-domain.service.ts`
- `apps/api/src/modules/templates/templates.controller.ts`
- `apps/api/src/modules/templates/__tests__/templates.controller.test.ts`

## Provider Adapter Architecture

The provider-neutral `TemplateProviderAdapter` interface exposes:

- `createTemplate(input)`
- `listTemplates(input)`
- optional `getTemplate(input)`
- optional `deleteTemplate(input)`

`MetaTemplateAdapter` implements the interface using Graph API endpoints and normalizes Meta responses into provider-neutral results. Controllers only call `TemplateDomainService`; they do not know about Meta.

## Credential/Config Approach

There is no WhatsApp account connection model yet, so Phase 13 uses `MetaTemplateCredentialResolver` with env-based fallback:

- `META_GRAPH_API_VERSION`, default `v21.0`
- `META_WABA_ID`
- `META_ACCESS_TOKEN`

Tokens are not hardcoded and are not included in API responses. Production needs tenant/store-specific credential storage before this is safe for multi-tenant use.

## Meta Payload Mapping For TEXT Templates

`mapCreateTemplateInputToMetaPayload` supports:

- text `HEADER`
- required `BODY`
- optional `FOOTER`
- `QUICK_REPLY`, `URL`, and `PHONE_NUMBER` buttons
- body/header examples generated from request variable sample values

Unsupported template types remain blocked by the domain layer.

## Create Flow After Meta Integration

`POST /api/templates` now:

1. Validates input and checks duplicate name/language within the admin tenant.
2. Creates the local template as `SUBMITTING`.
3. Builds the Meta payload.
4. Creates a provider payload audit row with action `CREATE`.
5. Calls `MetaTemplateAdapter.createTemplate`.
6. Stores provider response or error details.
7. Updates local status to the provider-normalized status, usually `PENDING`.
8. Creates `SUBMITTED` on success or `ERROR` on failure.

If Meta submission fails, the local record is kept with status `ERROR` and the API returns `TEMPLATE_PROVIDER_ERROR`.

## Sync Flow After Meta Integration

`POST /api/templates/sync` now:

1. Resolves Meta credentials.
2. Calls `MetaTemplateAdapter.listTemplates`.
3. Upserts local records by `metaTemplateId`, falling back to `name + languageCode`.
4. Updates status/category/type/language/quality/rejection reason/`lastSyncedAt`.
5. Stores provider payload audit data with action `SYNC`.
6. Creates a `SYNCED` event.
7. Returns `syncedCount`, `createdCount`, `updatedCount`, and `failedCount`.

Component reverse-mapping from Meta is intentionally shallow in this phase.

## Error Handling

Meta errors are normalized into `TemplateProviderError` with:

- provider
- code
- message
- statusCode
- raw response

Create failures map to `TEMPLATE_PROVIDER_ERROR`. Sync failures map to `TEMPLATE_SYNC_FAILED`. Authorization headers and access tokens are not logged or returned.

## Provider Payload Audit Logging

Create uses `WhatsAppTemplateProviderPayload` with action `CREATE`.

Sync uses `WhatsAppTemplateProviderPayload` with action `SYNC`.

Audit rows store request payloads where useful, response payloads, status codes, and normalized error fields when provider calls fail.

## Tests/Checks Run

```sh
pnpm --filter @qw-automations/api typecheck
pnpm --filter @qw-automations/api exec vitest run src/modules/templates/__tests__
pnpm --filter @qw-automations/api lint
```

Results:

- Typecheck passed and generated Prisma Client.
- Template tests passed: 8 files, 19 tests.
- Lint passed.

## Known Limitations

- Env credentials are temporary; production needs tenant/store-specific Meta credential storage.
- No webhook handling yet.
- No media, carousel, authentication, or media header templates.
- Sync does not fully reverse-map Meta component structures into local component/button/variable rows.
- Create failure leaves a local `ERROR` template for audit and troubleshooting.
- Provider delete is not wired yet.

## Phase 14 Readiness Checklist

- [ ] Add tenant/store-specific WhatsApp connection storage.
- [ ] Add webhook signature verification and status update handling.
- [ ] Expand sync reverse-mapping for components/buttons/variables.
- [ ] Add provider delete behavior if product requirements confirm it.
- [ ] Add frontend integration against the real backend endpoints.
- [ ] Add integration DB tests once a test database harness exists.
