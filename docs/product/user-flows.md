# User Flows

## Login

Admin visits `/login`, submits email and password, and receives an in-memory access token while the backend sets an httpOnly refresh cookie. Protected app routes refresh the session once on startup before deciding whether to render private content or redirect to `/login`. Logout revokes the refresh session, clears in-memory auth state, and returns the admin to `/login`.

## Template Creation

Admin creates a template locally, future API submits it to Meta, then local status is tracked.

## Template Sync

Admin requests sync, backend checks Meta status, and UI reflects approval state.

## Automation Configuration

Admin chooses a predefined automation, assigns an approved template, configures delay if applicable, and enables it.

## Shopify Order Event

Future Shopify webhook is verified, stored as a raw event, processed idempotently, and may trigger automation evaluation.

## WhatsApp Inbound Conversation

Meta webhook is verified, inbound message is stored, conversation unread count updates, socket event emits, and future push notification may fire.

## Mobile Reply

Admin opens conversation list, selects thread, replies within the 24-hour window, and returns to the list.
