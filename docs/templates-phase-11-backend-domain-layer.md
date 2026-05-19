# Templates Phase 11 Backend Domain Layer

## Summary

Phase 11 adds the backend domain foundation for WhatsApp templates. It introduces API-aligned DTO types, validation helpers, domain errors, a factory resolver, a text template factory, Prisma-backed repository methods, response mappers, and a domain service façade for Phase 12 API implementation.

No routes/controllers, frontend integration, Meta API calls, or database schema changes were added in this phase.

## Files Created/Modified

Created:

- `apps/api/src/modules/templates/domain/template.types.ts`
- `apps/api/src/modules/templates/domain/template.errors.ts`
- `apps/api/src/modules/templates/domain/template.constants.ts`
- `apps/api/src/modules/templates/domain/template.validators.ts`
- `apps/api/src/modules/templates/domain/template-variable.validator.ts`
- `apps/api/src/modules/templates/domain/template-button.validator.ts`
- `apps/api/src/modules/templates/domain/template-component.validator.ts`
- `apps/api/src/modules/templates/domain/template.factory.ts`
- `apps/api/src/modules/templates/domain/text-template.factory.ts`
- `apps/api/src/modules/templates/domain/template.mapper.ts`
- `apps/api/src/modules/templates/repositories/template.repository.ts`
- `apps/api/src/modules/templates/services/template-domain.service.ts`
- `apps/api/src/modules/templates/dto/create-template.dto.ts`
- `apps/api/src/modules/templates/dto/template-list-query.dto.ts`
- `apps/api/src/modules/templates/dto/template-response.dto.ts`
- `apps/api/src/modules/templates/index.ts`
- Template domain unit tests for validators, factory, and mapper.

Modified:

- `apps/api/src/modules/templates/templates.service.ts`
- `apps/api/src/modules/templates/templates.repository.ts`

## Domain Structure

The module follows the existing backend module convention under `apps/api/src/modules/templates`.

The domain layer owns template validation, construction, response mapping, and errors. The repository layer owns scoped Prisma access. The service layer coordinates these building blocks without implementing final API orchestration or provider submission.

## Validators Implemented

Implemented validators cover Phase 1 backend support for `TEXT` templates:

- Template name required and limited to lowercase letters, numbers, and underscores.
- Category/type/language required and enum-valid.
- Create support restricted to `TEXT`.
- Body text required and length-limited.
- Header supports only `NONE` and `TEXT` for the text MVP.
- Header/body/footer/button text length limits match frontend constants.
- Footer variables are rejected for the MVP.
- Variables are extracted from supported text fields.
- Variable syntax must be numeric placeholders such as `{{1}}`.
- Variable positions must be sequential with no gaps.
- Every detected variable requires a matching sample value.
- Buttons support `QUICK_REPLY`, `URL`, and `PHONE_NUMBER`.
- URL and phone buttons require valid-looking values.

`validateCreateTemplateInput` aggregates all validation errors.

## Factory Pattern

`TemplateFactoryResolver` chooses a factory based on `TemplateType`.

`TextTemplateFactory` accepts validated `CreateTemplateInput` and produces normalized persistence-ready data:

- Template core fields.
- Component rows.
- Variable rows.
- Button rows.
- Initial `CREATED` event data.

The factory uses local `DRAFT` status. Phase 12 can move records to `SUBMITTING` or `PENDING` when API create orchestration is added.

## Repository Methods

`TemplateRepository` implements:

- `findMany(query, scope)`
- `findById(id, scope)`
- `findByNameAndLanguage(name, languageCode, scope)`
- `createWithRelations(data, scope)`
- `updateStatus(id, status, scope)`
- `softDelete(id, scope)`
- `createProviderPayload(data)`
- `createEvent(data)`

List queries support search, status, category, type, language, pagination, sorting, and exclude soft-deleted records by default.

## Mapper Behavior

Mappers convert Prisma-like records into Phase 9 API contract responses:

- `mapTemplateToListItem(template)`
- `mapTemplateToDetailResponse(template)`

Detail mapping returns structured components:

```ts
components: {
  (header, body, footer, buttons);
}
```

Database table shape is not leaked to the API response.

## Tenant Scoping

Phase 10 chose `adminUserId` as the current tenant boundary because the schema has no workspace/store/business model yet. Repository reads and writes scope template access by `adminUserId` and never intentionally fetch active templates by id alone.

`updateStatus` and `softDelete` use scoped `updateMany` filters rather than unscoped unique-id updates.

## Tests And Checks

Commands run:

```sh
pnpm --filter @qw-automations/api typecheck
pnpm --filter @qw-automations/api exec vitest run src/modules/templates/__tests__/template-domain.validators.test.ts src/modules/templates/__tests__/template-domain.factory.test.ts src/modules/templates/__tests__/template-domain.mapper.test.ts
pnpm --filter @qw-automations/api lint
```

Results:

- API typecheck passed and generated Prisma Client.
- Focused template domain tests passed: 3 files, 8 tests.
- API lint passed.

An initial broad `pnpm --filter @qw-automations/api test -- templates` run entered Vitest watch mode and hit the existing Supertest health placeholder's sandbox listen restriction (`listen EPERM 0.0.0.0`). The new domain tests were rerun with `vitest run` and passed.

## Known Limitations

- Repository tests were skipped because there is no established integration database test pattern for this module yet.
- The domain error with validation `details` is ready for Phase 12, but the global error handler does not yet serialize details.
- Provider payload creation stores raw payload fields but no Meta payload builder exists yet.
- Component-to-variable/button linking is prepared by schema, but the Phase 11 factory keeps simple template-level rows until Phase 12 persistence orchestration decides component id handling.
- `TEXT` is the only supported create type.

## Phase 12 Readiness Checklist

- [ ] Add authenticated template routes under `/api/templates`.
- [ ] Parse and validate request DTOs using the domain validators/schemas.
- [ ] Serialize validation `details` in API error responses.
- [ ] Wire controllers to `TemplateDomainService`.
- [ ] Add route tests for auth, validation, duplicate names, list/detail mapping, and soft delete.
- [ ] Keep provider submission mocked or deferred until Phase 13.
