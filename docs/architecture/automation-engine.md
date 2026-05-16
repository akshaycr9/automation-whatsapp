# Automation Engine

Automations are predefined and seeded. Admins configure existing automations; they do not build arbitrary workflows in the MVP.

Only approved templates may be attached to active automations. Delayed automations must re-check latest order, customer, and checkout state before sending. Duplicate sends are prevented through idempotency and automation run logs.

Message lifecycle should be tracked as `queued -> sent -> delivered -> read -> failed`.
