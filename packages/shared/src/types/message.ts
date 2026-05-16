import { MessageStatus } from "../constants/message-statuses";

export type MessageSummary = {
  id: string;
  conversationId: string;
  body: string;
  status: MessageStatus;
};
