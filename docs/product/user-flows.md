# User Flows

## Login

Admin visits `/login`, submits email and password, and receives an in-memory access token while the backend sets httpOnly refresh and device cookies. Protected app routes refresh the session once on startup before deciding whether to render private content or redirect to `/login`. Refreshes update the current device session in place. Logout revokes the refresh session, clears in-memory auth state, and returns the admin to `/login`.

Manual verification checklist:

1. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_ACCESS_SECRET`, and `DATABASE_URL`.
2. Run `pnpm db:seed`.
3. Start the backend with `pnpm dev:api`.
4. Start the frontend with `pnpm dev:web`.
5. Open `/login`; invalid credentials should show the generic safe error.
6. Log in with the seeded admin; the app should redirect to the dashboard.
7. Open `/templates` while logged out; the app should redirect to `/login`.
8. Refresh the browser on the dashboard; a valid refresh cookie should keep the admin logged in.
9. Click the topbar sign-out avatar; the app should return to `/login`.
10. Confirm `localStorage` and `sessionStorage` contain no auth tokens.
11. Confirm the `qw_refresh_token` and `qw_device_id` cookies are httpOnly and scoped to `/api/auth`.
12. Confirm `/api/auth/me` returns `401` without a bearer token or with an invalid token.
13. Confirm repeated invalid logins trigger lockout or rate-limit behavior.

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
