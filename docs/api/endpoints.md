# API Endpoints

## Auth

### `POST /api/auth/login`

Auth: public, rate-limited.

Request:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Response:

```json
{
  "data": {
    "admin": {
      "id": "admin_id",
      "email": "admin@example.com",
      "lastLoginAt": "2026-05-17T00:00:00.000Z"
    },
    "accessToken": "jwt_access_token"
  }
}
```

Cookie: sets `qw_refresh_token` and `qw_device_id` as `httpOnly`, `sameSite=lax`, `path=/api/auth`, and `secure=true` in production. The refresh token is not returned in JSON. The device cookie is a stable random identifier used to keep one refresh-session row per admin device.

### `POST /api/auth/refresh`

Auth: valid `qw_refresh_token` cookie, rate-limited. Frontend must call with `credentials: "include"`.

Response shape matches login. The endpoint rotates the refresh token, updates the current device-scoped refresh session in place, and sets a new `qw_refresh_token` cookie. If the device cookie is missing but the refresh token is valid, the endpoint re-sets `qw_device_id` from the matched session.

### `POST /api/auth/logout`

Auth: optional `qw_refresh_token` cookie. Frontend should call with `credentials: "include"`.

Response:

```json
{
  "data": {
    "success": true
  }
}
```

The endpoint revokes the matching refresh session when present and always clears the refresh cookie. It keeps `qw_device_id` so the same browser can reuse its device slot on the next login.

### `GET /api/auth/me`

Auth: `Authorization: Bearer <accessToken>`.

Response:

```json
{
  "data": {
    "admin": {
      "id": "admin_id",
      "email": "admin@example.com",
      "lastLoginAt": "2026-05-17T00:00:00.000Z"
    }
  }
}
```

Auth error responses use:

```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password."
  }
}
```

## Automations

### `GET /api/automations`

Returns seeded automation flows grouped with their predefined automations. Flows and automations are sorted by `sortOrder`.

### `GET /api/automations/:id`

Returns one automation with template selection, delay, variable mappings, trigger metadata, and configuration status.

### `PUT /api/automations/:id`

Updates user-configurable fields only: `templateId`, `delayMinutes`, and `variableMappings`. System-defined fields such as key, trigger source/event, flow, name, and sort order are not accepted as editable configuration.

### `PATCH /api/automations/:id/toggle`

Enables or disables an automation. Enabling requires a selected template and all required template variables mapped or given fallbacks.

### `GET /api/automations/:id/field-options`

Returns allowed source-field options for the automation flow.

## Webhooks

### `POST /api/webhooks/shopify/:topic`

Receives Shopify webhooks for supported topics such as `orders-create`, `orders-fulfilled`, `orders-cancelled`, and `checkouts-update`. Requests must include a valid `X-Shopify-Hmac-Sha256` signature.

### `GET /api/webhooks/whatsapp`

Handles Meta webhook verification with `hub.mode`, `hub.verify_token`, and `hub.challenge`.

### `POST /api/webhooks/whatsapp`

Receives WhatsApp webhook events. Supported v1 events are interactive button/quick-reply payloads such as `COD_CONFIRM:ORDER:123456789` and `COD_CANCEL:ORDER:123456789`.

## Environment

Redis/BullMQ:

- `REDIS_URL`, or `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, and `REDIS_DB`
- `ENABLE_QUEUE_WORKERS` when worker startup is gated by environment

Shopify:

- `SHOPIFY_WEBHOOK_SECRET`

Meta/WhatsApp:

- `META_VERIFY_TOKEN`
- `META_APP_SECRET` for POST signature verification when configured
- Existing WhatsApp sender credentials used by template sending

Queue names:

- `automation-events-queue`
- `automation-send-queue`

## Planned Endpoint Groups

- `/dashboard`: operational analytics
- `/templates`: WhatsApp templates
- `/conversations`: inbox, threads, replies
- `/logs`: webhook, message, automation, error logs
- `/settings`: Shopify, Meta/WhatsApp, PWA, admin settings
