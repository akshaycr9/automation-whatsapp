# Webhook Flow

Shopify webhooks verify HMAC signatures with `SHOPIFY_WEBHOOK_SECRET`. Meta WhatsApp webhooks verify the GET handshake with `META_VERIFY_TOKEN`; POST signature verification uses `META_APP_SECRET` when it is configured. Handlers store raw payloads before normalized processing.

Webhook processing must be idempotent. Duplicate events should not duplicate `incoming_events`, automation jobs, or queued sends.

Webhook handlers never send WhatsApp messages directly. Shopify and WhatsApp webhooks enqueue `automation-events-queue` jobs with only:

```json
{ "incomingEventId": "incoming_event_id" }
```

Automation send work is handled later through `automation-send-queue` jobs with only:

```json
{ "automationJobId": "automation_job_id" }
```

This keeps customer payloads out of Redis job bodies and lets workers retry infrastructure failures without re-receiving webhook requests.
