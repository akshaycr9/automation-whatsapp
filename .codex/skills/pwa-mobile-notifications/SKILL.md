# PWA Mobile Notifications

## Purpose

Guide mobile-first PWA and future push notification work.

## When to Use

Use for mobile layout, installability, service worker planning, push subscription, and notification UX.

## Mobile UI

Design mobile-first with touch-friendly spacing. Tables become cards. Conversation list and thread are separate mobile screens with a back path.

## PWA

Manifest and service worker will be added later. Do not add service worker behavior until installability is planned.

## Push

Push notifications are mainly for inbound customer messages. Do not spam system events.

## Permission UX

Request notification permission only after clear user intent.

## Deep Links

Future notifications should deep-link to the relevant conversation.

## Do

Respect battery, focus, and mobile ergonomics.

## Do Not

Do not register noisy notifications, background sync, or service workers prematurely.
