import { startQueueWorkers } from "../modules/queues/index.js";

startQueueWorkers({ registerShutdownHooks: true });
