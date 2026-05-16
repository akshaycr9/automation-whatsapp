# Realtime Webhooks

## Purpose

Guide Shopify/Meta webhook processing and realtime updates.

## When to Use

Use for webhook handlers, raw event storage, conversation updates, socket events, and inbound WhatsApp flows.

## Shopify Rules

Verify HMAC signatures before processing. Store raw payloads.

## Meta WhatsApp Rules

Verify token/signature before processing. Store raw payloads and normalize inbound messages after verification.

## Raw Storage

Raw events support debugging, idempotency, and replay.

## Inbound Messages

Inbound WhatsApp messages update conversation, unread count, and 24-hour customer service window state.

## Socket Events

Use granular events such as `conversation.updated`, `message.received`, `message.status.updated`, and `automation.triggered`.

## Payloads

Do not emit unnecessarily heavy socket payloads.

## Do

Keep webhook processing idempotent and observable.

## Do Not

Do not trust webhook payloads without verification or send WhatsApp messages directly from webhook handlers.
