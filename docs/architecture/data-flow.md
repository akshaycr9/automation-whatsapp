# Future Data Flows

## Shopify to WhatsApp

Shopify webhook -> verify signature -> store raw event log -> automation engine -> queue -> WhatsApp send -> message log.

## WhatsApp Inbound

WhatsApp inbound message -> Meta webhook verification -> raw event storage -> conversation update -> socket event -> future push notification.

## Template Creation

Template creation -> Meta API -> local template record -> status sync -> approved template assignment.
