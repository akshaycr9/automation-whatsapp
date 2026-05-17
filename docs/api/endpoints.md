# API Endpoints

## Auth

- `POST /api/auth/login`: validates admin credentials, sets the `qw_refresh_token` httpOnly cookie, and returns a short-lived access token plus safe admin profile.
- `POST /api/auth/refresh`: rotates a valid refresh cookie session and returns a new access token plus safe admin profile.
- `POST /api/auth/logout`: revokes the current refresh session when present and clears the refresh cookie.
- `GET /api/auth/me`: requires a bearer access token and returns the current safe admin profile.

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
