import { closeQueues, getAutomationEventsQueue, getAutomationSendQueue } from "../providers/queue.provider.js";

export class BullMqService {
  initializeQueues() {
    return {
      automationEventsQueue: getAutomationEventsQueue(),
      automationSendQueue: getAutomationSendQueue()
    };
  }

  async close() {
    await closeQueues();
  }
}
