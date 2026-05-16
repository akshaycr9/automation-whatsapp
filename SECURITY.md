# Security Policy

## Secrets

No secrets belong in this repository. Use local `.env` files and deployment secret stores. `.env.example` documents required variable names only.

## Webhooks

Shopify and Meta/WhatsApp webhooks must be verified before processing. Future handlers must store raw webhook payloads for debugging and idempotency.

## External Tokens

Shopify, Meta, WhatsApp, Redis, JWT, and push notification secrets must stay server-side. The frontend must never receive Meta or Shopify secrets.

## Reporting and Review

Security review process is a placeholder until deployment planning. Any change touching auth, webhook verification, secrets, or message sending should receive extra review and tests.
