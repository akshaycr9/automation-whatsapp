import "dotenv/config";
import {
  AutomationEventQueueService,
  AutomationSendQueueService,
  closeQueues
} from "../apps/api/src/modules/queues/index.js";

async function main() {
  const eventQueue = new AutomationEventQueueService();
  const sendQueue = new AutomationSendQueueService();

  const eventJobId = await eventQueue.addEventProcessingJob({
    incomingEventId: "dev-incoming-event-id",
    idempotencyKey: `dev:event:${Date.now()}`
  });

  const sendJobId = await sendQueue.addSendJob({
    automationJobId: "dev-automation-job-id",
    idempotencyKey: `dev:send:${Date.now()}`,
    delayMs: 1000
  });

  console.log(`Automation event job enqueued: ${eventJobId}`);
  console.log(`Automation send job enqueued: ${sendJobId}`);
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeQueues();
  });
