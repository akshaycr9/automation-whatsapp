# Templates Phase 10 Database Schema

## Summary

Phase 10 adds the local PostgreSQL schema for WhatsApp templates. The design stores frequently queried fields in normalized columns, keeps template components, variables, and buttons in separate tables, and adds provider payload and event tables for future Meta integration debugging and audit trails.

No backend controllers, services, frontend integration, Meta API calls, or seed data were added in this phase.

## Models Added

- `WhatsAppTemplate`: logical template record scoped to the current admin tenant.
- `WhatsAppTemplateComponent`: header, body, footer, buttons, and future carousel component rows.
- `WhatsAppTemplateVariable`: template placeholders such as `{{1}}`, sample values, future source mappings, and fallbacks.
- `WhatsAppTemplateButton`: URL, phone number, quick reply, copy code, and flow button metadata.
- `WhatsAppTemplateProviderPayload`: raw request/response snapshots for provider submissions, syncs, deletes, and webhook handling.
- `WhatsAppTemplateEvent`: lifecycle and audit event timeline.

## Enums Added

- `TemplateType`
- `TemplateCategory`
- `TemplateStatus`
- `TemplateComponentType`
- `TemplateHeaderFormat`
- `TemplateButtonType`
- `TemplateQualityRating`
- `TemplateProvider`
- `TemplateProviderAction`
- `TemplateEventType`

`TemplateHeaderFormat` includes `LOCATION` for provider readiness beyond the Phase 9 API contract.

## Tenant Scoping Decision

The current Prisma schema has no workspace, store, business, organization, or tenant model. It only has `AdminUser`, and the product is currently a single-admin MVP.

Templates are therefore scoped with required `adminUserId` on `WhatsAppTemplate`. Optional `createdById` and `updatedById` also point to `AdminUser` for audit metadata.

Future store/workspace modeling should migrate template scoping from `adminUserId` to the chosen tenant entity while preserving admin audit relations.

## Indexes And Constraints

`WhatsAppTemplate`:

- Unique: `adminUserId + name + languageCode`
- Index: `adminUserId + status`
- Index: `adminUserId + category`
- Index: `adminUserId + type`
- Index: `adminUserId + languageCode`
- Index: `metaTemplateId`
- Index: `wabaId`
- Index: `deletedAt`

Child tables:

- `WhatsAppTemplateComponent`: unique `templateId + componentType + sortOrder`, index `templateId`
- `WhatsAppTemplateVariable`: unique `templateId + componentType + position`, indexes `templateId`, `componentId`
- `WhatsAppTemplateButton`: unique `templateId + sortOrder`, indexes `templateId`, `componentId`
- `WhatsAppTemplateProviderPayload`: indexes `templateId`, `provider + action`, `createdAt`
- `WhatsAppTemplateEvent`: indexes `templateId`, `eventType`, `createdAt`

## Soft Delete Approach

`WhatsAppTemplate.deletedAt` supports local soft delete. The template status can also move to `DELETED` for API consistency. Child records remain attached so detail, audit, and provider troubleshooting data are preserved until an explicit data retention policy exists.

The unique constraint intentionally remains `adminUserId + name + languageCode`; a soft-deleted template still reserves its provider-facing name unless a future product decision permits restoring or renaming old records.

## Provider Payload Audit Approach

`WhatsAppTemplateProviderPayload` stores optional `requestPayload`, `responsePayload`, HTTP/provider status metadata, and errors. `templateId` is nullable so failed syncs or webhook payloads can still be recorded before a local template record is resolved.

## Event Timeline Approach

`WhatsAppTemplateEvent` records lifecycle transitions and operational events such as `CREATED`, `SUBMITTED`, `APPROVED`, `REJECTED`, `SYNCED`, `WEBHOOK_RECEIVED`, and `ERROR`. It supports old/new status fields, a human-readable message, JSON metadata, and optional admin attribution.

## Future Media And Carousel Extension Notes

The schema is enum-ready for `MEDIA`, `CAROUSEL`, and `AUTHENTICATION`, but this phase intentionally does not add media asset or carousel card tables. Those should be introduced once the UI/API contract for those template types is approved.

Buttons and variables already support future component association through nullable `componentId`, while still allowing simple template-level lookups.

## Migration

Migration name:

```text
20260519153403_add_whatsapp_templates
```

`prisma migrate dev --create-only` could not create the migration in this local environment because Prisma's schema engine failed while connecting to the configured local database. The migration SQL was created manually from the formatted Prisma schema and then validated through Prisma schema validation and API typecheck/client generation.

## Commands Run

```sh
pnpm exec prisma format --schema prisma/schema.prisma
pnpm exec prisma migrate dev --schema prisma/schema.prisma --name add_whatsapp_templates --create-only
pnpm exec prisma migrate diff --from-migrations prisma/migrations --to-schema-datamodel prisma/schema.prisma --script
pnpm exec prisma validate --schema prisma/schema.prisma
pnpm --filter @qw-automations/api typecheck
pnpm --filter @qw-automations/api lint
```

Results:

- Prisma format passed.
- `migrate dev --create-only` failed with a schema engine error against the configured local PostgreSQL database.
- `migrate diff` required a shadow database URL for diffing from migrations.
- Prisma validate passed.
- API typecheck passed and generated Prisma Client.
- API lint passed.

## Phase 11 Readiness Checklist

- [ ] Apply the migration against the development database once PostgreSQL is reachable.
- [ ] Add repository methods scoped by `adminUserId` plus template id/name/language.
- [ ] Add thin services for list/detail/create/sync/delete using these models.
- [ ] Add controller validation using the Phase 9 contract schemas.
- [ ] Add route tests for authenticated access, tenant scoping, soft delete, and unique-name behavior.
- [ ] Keep Meta provider client and webhook persistence behind adapters in later phases.
