# Security Policy

## Secrets

No secrets belong in this repository. Use local `.env` files and deployment secret stores. `.env.example` documents required variable names only.

## Webhooks

Shopify and Meta/WhatsApp webhooks must be verified before processing. Future handlers must store raw webhook payloads for debugging and idempotency.

## External Tokens

Shopify, Meta, WhatsApp, Redis, JWT, and push notification secrets must stay server-side. The frontend must never receive Meta or Shopify secrets.

## Passwords

Admin passwords are never stored in plaintext. MVP passwords are hashed with bcrypt using `BCRYPT_ROUNDS`, through a password service abstraction that can later move to Argon2id. Seeded admin passwords must meet the backend strength policy and must not be printed.

## Tokens and Cookies

Access tokens are short-lived JWTs returned by auth endpoints. Refresh tokens are opaque random tokens stored only in the `qw_refresh_token` httpOnly cookie with `sameSite=lax`, `path=/api/auth`, and `secure=true` in production. Only refresh token hashes are stored in the database, and sessions rotate on refresh.

## Brute-Force Protection

Login uses IP-based rate limiting and failed-login tracking. Existing admin accounts lock temporarily after repeated failures. Login errors intentionally use generic messages so responses do not reveal whether an email exists.

## Logging

Auth logs may include event names, admin IDs, and email addresses. Logs must never include plaintext passwords, password hashes, access tokens, refresh tokens, or cookie values.

## Reporting and Review

Security review process is a placeholder until deployment planning. Any change touching auth, webhook verification, secrets, or message sending should receive extra review and tests.
