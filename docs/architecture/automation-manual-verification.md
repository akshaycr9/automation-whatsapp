# Automation Manual Verification

Use local test secrets only. Do not use production Shopify, Meta, or WhatsApp credentials while running these checks.

## Scenario 1: Prepaid Order Confirmed

1. Configure `ORDER_CONFIRMED` with an approved template and required variable mappings.
2. Enable the automation.
3. Send a Shopify `orders-create` webhook for a non-COD order with a valid HMAC.
4. Verify `incoming_events` contains `SHOPIFY` / `ORDER_CREATED`.
5. Verify `automation-events-queue` processes `{ incomingEventId }`.
6. Verify one `automation_jobs` row exists for `ORDER_CONFIRMED`.
7. Verify `automation-send-queue` processes `{ automationJobId }`.
8. Verify the WhatsApp template sender is called and the job becomes `COMPLETED`.

## Scenario 2: COD Order Confirmation and Follow-up

1. Configure and enable `COD_ORDER_CONFIRMATION`.
2. Configure and enable `COD_ORDER_FOLLOW_UP` with a delay.
3. Send a Shopify `orders-create` COD webhook.
4. Verify `automation_action_states` has `COD_FLOW` / `ORDER` / order id = `PENDING_CONFIRMATION`.
5. Verify one immediate confirmation job and one delayed follow-up job are queued.
6. Verify the confirmation job sends and completes.
7. Verify the follow-up job remains queued or delayed until due.

## Scenario 3: COD Confirm Button

1. Start from an order with `PENDING_CONFIRMATION`.
2. Send a WhatsApp button reply with `COD_CONFIRM:ORDER:<orderId>`.
3. Verify `incoming_events` contains `WHATSAPP` / `BUTTON_REPLY`.
4. Verify `automation_action_states` becomes `CONFIRMED`.
5. Verify `COD_ORDER_CONFIRMED` is queued and sent.
6. Verify any pending `COD_ORDER_FOLLOW_UP` job is cancelled or skipped.
7. Re-send the same webhook and verify no duplicate job is created.

## Scenario 4: COD Cancel Button

1. Start from an order with `PENDING_CONFIRMATION`.
2. Send a WhatsApp button reply with `COD_CANCEL:ORDER:<orderId>`.
3. Verify `automation_action_states` becomes `CANCELLED`.
4. Verify `COD_ORDER_CANCELLED` is queued and sent.
5. Verify any pending `COD_ORDER_FOLLOW_UP` job is cancelled or skipped.

## Scenario 5: COD Follow-up Skip

1. Create or queue a delayed `COD_ORDER_FOLLOW_UP` job.
2. Set the matching COD action state to `CONFIRMED` or `CANCELLED` before the job runs.
3. Process the send job.
4. Verify the job becomes `SKIPPED` and no WhatsApp template is sent.

## Scenario 6: Abandoned Cart Flow

1. Configure and enable `ABANDONED_CART_1`, `ABANDONED_CART_2`, and `ABANDONED_CART_3`.
2. Send a supported abandoned checkout webhook.
3. Verify `incoming_events` contains `SHOPIFY` / `CHECKOUT_ABANDONED`.
4. Verify enabled abandoned cart jobs are created with configured delays.
5. Process a due send job and verify `checkout.recoveryUrl` resolves into template variables.

## Scenario 7: Failed WhatsApp Sender Retry

1. Force the local WhatsApp sender/mock to fail.
2. Process a valid automation send job.
3. Verify the job becomes `FAILED` and the worker throws so BullMQ retries.
4. Restore the sender and verify a later retry can complete the job.

## Scenario 8: Disabled Automation

1. Queue a valid automation job.
2. Disable the automation before the send worker processes it.
3. Process the send job.
4. Verify the job becomes `SKIPPED` and no WhatsApp template is sent.
