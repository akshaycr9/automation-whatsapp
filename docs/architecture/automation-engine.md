# Automation Engine

Automations are predefined and seeded. Admins configure existing automations; they do not build arbitrary workflows in the MVP.

Only approved templates may be attached to active automations. Delayed automations re-check runtime conditions before sending, especially COD follow-up state and conservative abandoned-checkout recovery data when it is already present in the event payload.

The v1 processing path is:

1. Shopify or WhatsApp webhook stores an `incoming_events` row.
2. `automation-events-queue` receives only `{ incomingEventId }`.
3. The event processor rebuilds the internal event with the source adapter.
4. The automation engine creates idempotent `automation_jobs` records.
5. `automation-send-queue` receives only `{ automationJobId }`.
6. The send worker resolves variables and calls the WhatsApp template sender.
7. `automation_jobs.status` is updated to `COMPLETED`, `SKIPPED`, `FAILED`, or `CANCELLED`.

Duplicate sends are prevented with stable `automation_jobs.idempotencyKey` values and terminal job-status checks before sending. Delivery/read tracking, conversations, and message logs are intentionally outside the v1 automation engine.

COD button payloads use:

```text
ACTION_KEY:RESOURCE_TYPE:RESOURCE_ID
```

Examples:

```text
COD_CONFIRM:ORDER:123456789
COD_CANCEL:ORDER:123456789
```

COD state transitions are stored in `automation_action_states` with `COD_FLOW`, `ORDER`, and the order id. The first final state wins: once an order is `CONFIRMED` or `CANCELLED`, later conflicting button replies are ignored.
