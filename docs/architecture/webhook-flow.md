# Webhook Flow

Shopify webhooks must verify HMAC signatures. Meta WhatsApp webhooks must verify token/signature. Handlers must store raw payloads before normalized processing.

Webhook processing must be idempotent. Duplicate events should not duplicate sends, logs, unread counts, or automation runs.

WhatsApp sends must happen through future queue jobs, not directly inside webhook handlers.
