import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import { config } from "config.js";

const DEFAULT_REDIS_URL = "redis://localhost:6379";

const redisClient = createClient({
  url: config.redisUrl || DEFAULT_REDIS_URL,
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "volvo:sess:",
  ttl: 86400 * 7,
  disableTouch: false,
  disableTTL: false,
});

async function connectRedis() {
  await redisClient.connect();
}

export { redisClient, redisStore, connectRedis };
