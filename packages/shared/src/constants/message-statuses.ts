export const MESSAGE_STATUSES = ["queued", "sent", "delivered", "read", "failed"] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];
