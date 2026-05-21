import { getRedisConnectionOptions } from "../providers/queue.provider.js";

export class RedisService {
  getConnectionOptions() {
    return getRedisConnectionOptions();
  }
}
