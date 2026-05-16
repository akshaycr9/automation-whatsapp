# Database Automation Engine

## Purpose

Guide Prisma schema and predefined automation engine work.

## When to Use

Use for database models, seeds, automation rules, message lifecycle, duplicate prevention, and related tests.

## Prisma Rules

PostgreSQL-compatible schema. Use enums for statuses later. Index external IDs. Avoid nullable fields unless required. Never delete migrations manually.

## Automation Seeds

Predefined automation keys are seeded and stable. Admin configures existing automations; admin does not create arbitrary workflow trees in MVP.

## Template Mapping

Only approved templates can be assigned to active automations.

## Instant and Delayed Automations

Delayed automations must re-check order/customer/checkout state before sending.

## COD and Abandoned Cart

COD follow-ups and abandoned cart reminders must verify current state before sending.

## Message Lifecycle

Track `queued -> sent -> delivered -> read -> failed`.

## Duplicate Prevention

Prevent duplicate sends with idempotency keys and run logs.

## Required Future Tests

Webhook signatures, invalid payloads, duplicate events, raw event storage, approved-template requirement, duplicate send prevention, delayed revalidation, COD conditions, abandoned cart conversion re-check, inbound messages, unread counts, 24-hour window, closed-window restrictions.

## Do

Keep seeds idempotent and model constraints explicit.

## Do Not

Do not implement arbitrary workflow builders or send messages directly from webhook handlers.
