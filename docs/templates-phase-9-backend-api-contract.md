# Templates Phase 9 Backend API Contract

## Summary

Phase 9 defines the backend API contract for the Templates feature so the frontend, backend, and future Meta integration can align before persistence or provider calls are implemented.

This phase does not add database migrations, Prisma models, real backend business logic, Meta API calls, route handlers, or frontend behavior changes.

The contract assumes all template endpoints are authenticated admin APIs and that future reads/writes are scoped by the active workspace, store, or business context in addition to the template id.

## Endpoint List

| Method   | Path                  | Purpose                                              | Auth           |
| -------- | --------------------- | ---------------------------------------------------- | -------------- |
| `GET`    | `/api/templates`      | List templates with filters, sorting, and pagination | Required       |
| `GET`    | `/api/templates/:id`  | Fetch one template detail                            | Required       |
| `POST`   | `/api/templates`      | Submit a new template                                | Required       |
| `POST`   | `/api/templates/sync` | Sync templates from Meta into local records          | Required       |
| `DELETE` | `/api/templates/:id`  | Soft-delete a local template record                  | Required       |
| `GET`    | `/webhooks/meta`      | Meta webhook callback verification                   | Verify token   |
| `POST`   | `/webhooks/meta`      | Meta webhook callback receiver                       | Meta signature |

## Enums

```ts
type TemplateType = "TEXT" | "MEDIA" | "CAROUSEL" | "AUTHENTICATION";
type TemplateCategory = "UTILITY" | "MARKETING" | "AUTHENTICATION";
type TemplateStatus =
  | "DRAFT"
  | "SUBMITTING"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "PAUSED"
  | "DISABLED"
  | "DELETED"
  | "ERROR";
type TemplateComponentType = "HEADER" | "BODY" | "FOOTER" | "BUTTONS" | "CAROUSEL";
type TemplateHeaderFormat = "NONE" | "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT";
type TemplateButtonType = "QUICK_REPLY" | "URL" | "PHONE_NUMBER" | "COPY_CODE" | "FLOW";
type QualityRating = "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
```

## DTO Definitions

### Template List Item

```ts
type TemplateListItemDto = {
  id: string;
  metaTemplateId: string | null;
  name: string;
  displayName: string;
  category: TemplateCategory;
  type: TemplateType;
  languageCode: string;
  status: TemplateStatus;
  qualityRating: QualityRating;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string | null;
};
```

### Template Detail

```ts
type TemplateDetailDto = TemplateListItemDto & {
  components: {
    header?: {
      format: "TEXT";
      text: string;
    };
    body: {
      text: string;
    };
    footer?: {
      text: string;
    };
    buttons: Array<
      | { type: "QUICK_REPLY"; text: string }
      | { type: "URL"; text: string; url: string }
      | { type: "PHONE_NUMBER"; text: string; phoneNumber: string }
      | { type: "COPY_CODE"; text: string }
      | { type: "FLOW"; text: string }
    >;
  };
  variables: Array<{
    componentType: "BODY";
    position: number;
    placeholder: string;
    sampleValue: string;
    sourceKey: string | null;
  }>;
};
```

### Pagination

```ts
type PaginationDto = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
```

## `GET /api/templates`

### Query Params

| Name           | Type                                                             | Notes                                                  |
| -------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| `search`       | `string`                                                         | Optional search over `name` and `displayName`.         |
| `status`       | `TemplateStatus`                                                 | Optional exact status filter.                          |
| `category`     | `TemplateCategory`                                               | Optional exact category filter.                        |
| `type`         | `TemplateType`                                                   | Optional exact type filter.                            |
| `languageCode` | `string`                                                         | Optional exact language code filter.                   |
| `page`         | `number`                                                         | Optional, 1-based. Default should be `1`.              |
| `limit`        | `number`                                                         | Optional. Default should be `20`; max should be `100`. |
| `sortBy`       | `"createdAt" \| "updatedAt" \| "name" \| "status" \| "category"` | Optional. Default should be `updatedAt`.               |
| `sortOrder`    | `"asc" \| "desc"`                                                | Optional. Default should be `desc`.                    |

### Response

```json
{
  "data": [
    {
      "id": "tmpl_123",
      "metaTemplateId": "optional_meta_id",
      "name": "order_confirmation_v1",
      "displayName": "Order Confirmation",
      "category": "UTILITY",
      "type": "TEXT",
      "languageCode": "en",
      "status": "APPROVED",
      "qualityRating": "GREEN",
      "rejectionReason": null,
      "createdAt": "2026-05-19T10:00:00.000Z",
      "updatedAt": "2026-05-19T10:00:00.000Z",
      "lastSyncedAt": "2026-05-19T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

## `GET /api/templates/:id`

### Response

```json
{
  "data": {
    "id": "tmpl_123",
    "metaTemplateId": "optional_meta_id",
    "name": "order_confirmation_v1",
    "displayName": "Order Confirmation",
    "category": "UTILITY",
    "type": "TEXT",
    "languageCode": "en",
    "status": "APPROVED",
    "qualityRating": "GREEN",
    "rejectionReason": null,
    "components": {
      "header": {
        "format": "TEXT",
        "text": "Order confirmed"
      },
      "body": {
        "text": "Hi {{1}}, your order {{2}} has been confirmed."
      },
      "footer": {
        "text": "Qwertees"
      },
      "buttons": [
        {
          "type": "URL",
          "text": "Track Order",
          "url": "https://example.com/track"
        }
      ]
    },
    "variables": [
      {
        "componentType": "BODY",
        "position": 1,
        "placeholder": "{{1}}",
        "sampleValue": "Akshay",
        "sourceKey": null
      }
    ],
    "createdAt": "2026-05-19T10:00:00.000Z",
    "updatedAt": "2026-05-19T10:00:00.000Z",
    "lastSyncedAt": null
  }
}
```

## `POST /api/templates`

### Request

```json
{
  "name": "order_confirmation_v1",
  "displayName": "Order Confirmation",
  "category": "UTILITY",
  "type": "TEXT",
  "languageCode": "en",
  "components": {
    "header": {
      "format": "TEXT",
      "text": "Order confirmed"
    },
    "body": {
      "text": "Hi {{1}}, your order {{2}} has been confirmed."
    },
    "footer": {
      "text": "Qwertees"
    },
    "buttons": [
      {
        "type": "URL",
        "text": "Track Order",
        "url": "https://example.com/track"
      }
    ]
  },
  "variables": [
    {
      "componentType": "BODY",
      "position": 1,
      "placeholder": "{{1}}",
      "sampleValue": "Akshay",
      "sourceKey": null
    },
    {
      "componentType": "BODY",
      "position": 2,
      "placeholder": "{{2}}",
      "sampleValue": "#QW12345",
      "sourceKey": null
    }
  ]
}
```

### Response

```json
{
  "data": {
    "id": "tmpl_123",
    "name": "order_confirmation_v1",
    "displayName": "Order Confirmation",
    "category": "UTILITY",
    "type": "TEXT",
    "languageCode": "en",
    "status": "PENDING",
    "createdAt": "2026-05-19T10:00:00.000Z",
    "updatedAt": "2026-05-19T10:00:00.000Z"
  },
  "message": "Template submitted successfully"
}
```

### Future Flow

The backend should eventually validate the request, persist a local record, build a Meta-compatible payload, submit the template to Meta, store the provider response, and return a normalized template response.

For the first backend implementation, only `TEXT` templates should be accepted. `MEDIA`, `CAROUSEL`, and `AUTHENTICATION` should return `TEMPLATE_UNSUPPORTED_TYPE` until explicitly implemented.

## `POST /api/templates/sync`

### Request

```json
{}
```

### Response

```json
{
  "data": {
    "syncedCount": 12,
    "createdCount": 2,
    "updatedCount": 10,
    "failedCount": 0
  },
  "message": "Templates synced successfully"
}
```

## `DELETE /api/templates/:id`

### Response

```json
{
  "data": {
    "id": "tmpl_123",
    "status": "DELETED"
  },
  "message": "Template deleted successfully"
}
```

Deletion should be a local soft delete first. Meta deletion can be added later depending on product and provider support.

## Meta Webhook: `/webhooks/meta`

Meta webhooks use one callback URL and dispatch by `entry[].changes[].field`.

- `GET /webhooks/meta` verifies callback setup with `hub.verify_token` and `hub.challenge`.
- `POST /webhooks/meta` verifies the Meta signature before parsing trusted data.
- `message_template_status_update` is handled by the template status handler.
- `messages` is acknowledged for future conversation processing.
- Unsupported fields are ignored with a lightweight success acknowledgement.

## Error Response Format

The current backend error handler returns:

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required."
  }
}
```

Template validation should extend that shape with optional field details:

```json
{
  "error": {
    "code": "TEMPLATE_VALIDATION_ERROR",
    "message": "Template validation failed",
    "details": [
      {
        "field": "name",
        "message": "Template name must contain only lowercase letters, numbers, and underscores."
      }
    ]
  }
}
```

## Error Codes

| Code                        | Typical Status | Meaning                                                                    |
| --------------------------- | -------------- | -------------------------------------------------------------------------- |
| `TEMPLATE_VALIDATION_ERROR` | `400`          | Request body or query params failed validation.                            |
| `TEMPLATE_DUPLICATE_NAME`   | `409`          | A template with the same name already exists in the scoped store/business. |
| `TEMPLATE_NOT_FOUND`        | `404`          | No scoped template record matched the requested id.                        |
| `TEMPLATE_UNSUPPORTED_TYPE` | `422`          | The type is valid but not implemented yet.                                 |
| `TEMPLATE_PROVIDER_ERROR`   | `502`          | Meta returned an error while submitting or deleting.                       |
| `TEMPLATE_SYNC_FAILED`      | `502`          | Sync failed or partially failed due to provider issues.                    |
| `UNAUTHORIZED`              | `401`          | No valid admin session/access token.                                       |
| `FORBIDDEN`                 | `403`          | Authenticated admin cannot access the scoped store/business.               |
| `INTERNAL_SERVER_ERROR`     | `500`          | Unexpected backend failure.                                                |

## Auth And Authorization

Every `/api/templates` endpoint should use the existing auth middleware pattern from `apps/api/src/modules/auth/auth.middleware.ts`.

Future implementation must not trust `:id` alone. Repository queries and mutations should scope by:

- Template id.
- Workspace, store, or business id derived from the authenticated session.
- Admin authorization rules for that scope.

Webhook endpoints should not use admin bearer auth. They should use Meta signature verification and provider account scoping once webhook infrastructure is implemented.

## Validation Rules

- `name` is required.
- `name` must contain only lowercase letters, numbers, and underscores.
- `displayName` is required.
- `category` is required and enum-valid.
- `type` is required and enum-valid.
- For the first backend implementation, `type` must be `TEXT`.
- `languageCode` is required.
- `components.body.text` is required.
- `components.body.text` length must be `<= BODY_TEXT_MAX_LENGTH` (`1024`).
- `components.header.text` length must be `<= HEADER_TEXT_MAX_LENGTH` (`60`).
- `components.footer.text` length must be `<= FOOTER_TEXT_MAX_LENGTH` (`60`).
- Button text length must be `<= BUTTON_TEXT_MAX_LENGTH` (`25`).
- Variables must be sequential from `{{1}}` with no gaps.
- Variable `position` must match the numeric placeholder value.
- Every detected variable must have a non-empty `sampleValue`.
- Unsupported template types must be rejected until implemented.

## Frontend Alignment Notes

The Phase 8 frontend API layer is close to this contract, but these adjustments are needed when replacing mock data with HTTP calls:

- `TemplateQualityRating` currently uses `"HIGH" | "MEDIUM" | "LOW" | "UNKNOWN"` in `apps/web/src/features/templates/types/template.types.ts`; the backend contract uses Meta-style `"GREEN" | "YELLOW" | "RED" | "UNKNOWN"`.
- `TemplateListResponse.pagination` currently has `page`, `limit`, and `total`; backend responses also include `totalPages`.
- `SyncTemplatesResponse` currently returns `data: Template[]` and `syncedAt`; backend contract returns sync counters in `data`.
- `CreateTemplateResponse.data.status` is currently mocked as `DRAFT`; backend contract returns `PENDING` after submission.
- Frontend list filters include `"ALL"` sentinel values; the HTTP API should omit those params rather than sending `"ALL"`.
- Frontend `Template.components` is currently an array of generic components for view models; backend detail returns structured `components.header/body/footer/buttons`.
- Frontend create payload variables currently omit `sourceKey`; backend accepts `sourceKey` as optional or `null`.
- The shared package currently has a placeholder lowercase `TemplateCategory` in `packages/shared/src/constants/template-categories.ts`; avoid reusing that for this API until shared template types are intentionally updated.

## Future Meta Integration Notes

- Keep local DTOs normalized and avoid leaking raw Meta response shapes to the frontend.
- Store provider ids separately from local ids as `metaTemplateId`.
- Preserve raw provider error payloads in backend logs or audit storage, but expose sanitized `TEMPLATE_PROVIDER_ERROR` responses.
- Map Meta quality/status values into the contract enums at the provider adapter boundary.
- Submit future sends through queue jobs; template creation itself may be synchronous or staged depending on provider latency and UX decisions.
- Webhook status updates should be idempotent and scoped by provider account plus local workspace/store/business context.

## Phase 10 Readiness Checklist

- [ ] Register authenticated template routes under `/api/templates`.
- [ ] Add controller methods with thin request parsing and response mapping.
- [ ] Add service methods for list/detail/create/sync/delete using mock or repository boundaries only as approved.
- [ ] Add repository interfaces once persistence design is approved.
- [ ] Add request validation middleware or controller-level Zod parsing.
- [ ] Add route tests for auth, validation, and response envelopes.
- [ ] Update frontend API internals to call HTTP endpoints after backend routes exist.
- [ ] Defer Prisma models, migrations, Meta clients, and webhook persistence until their dedicated phases.
