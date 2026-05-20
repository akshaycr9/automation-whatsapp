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

## Planned Endpoint Groups

- `/dashboard`: operational analytics
- `/templates`: WhatsApp templates
- `/automations`: predefined automation configuration
- `/conversations`: inbox, threads, replies
- `/logs`: webhook, message, automation, error logs
- `/settings`: Shopify, Meta/WhatsApp, PWA, admin settings
- `/webhooks/shopify`: Shopify webhook receiver
- `/webhooks/meta`: Meta WhatsApp webhook receiver
