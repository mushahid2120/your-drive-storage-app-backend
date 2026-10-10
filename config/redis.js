import { createClient } from "redis";

const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 6379,
    tls: true,
    servername: process.env.REDIS_HOST,
  },
  connectTimeout: 10000,

  // Send TCP keepalive probes after 30 seconds
  keepAlive: 30000,
  keepAliveInitialDelay: 30000,

  reconnectStrategy: (retries, cause) => {
    console.error(`Redis reconnect attempt ${retries}:`, cause?.message);
  },
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis ready for commands");
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

redisClient.on("end", () => {
  console.log("Redis connection ended");
});

redisClient.on("error", (error) => {
  console.error("Redis error:", error.message);
});

// const existingIndexes = await redisClient.ft._list();

// if (existingIndexes.length === 0) {
//   const userIdIdx = await redisClient.ft.create(
//     "userIdIdx",
//     { "$.userId": { type: SCHEMA_FIELD_TYPE.TAG, AS: "userId" } },
//     { ON: "JSON", PREFIX: "session" }
//   );
//   console.log(userIdIdx, ": Index is created")
// }

console.log("connected to Redis");
export default redisClient;
