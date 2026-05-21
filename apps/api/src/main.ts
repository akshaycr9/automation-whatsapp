import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";
import { startQueueWorkers, stopQueueWorkers } from "./modules/queues/index.js";

const app = createApp();

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info(`API listening on http://${env.HOST}:${env.PORT}`);
  startQueueWorkers({ registerShutdownHooks: false });
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => {
    server.close(() => {
      void stopQueueWorkers().finally(() => {
        process.exit(0);
      });
    });
  });
}
