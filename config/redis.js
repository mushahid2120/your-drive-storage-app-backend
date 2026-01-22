import { createClient, SCHEMA_FIELD_TYPE } from "redis";

const redisClient = await createClient({
  username: "default",
  password: "tK6l5ClHt0xUULOADRYsOqcWGR3MPkxT",
  socket: {
    host: "redis-18490.crce182.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 18490,
  },
});

redisClient.on("error", (error) => {
  console.log("Redis Client Error", error);
  process.exit(1);
});

redisClient.connect();

const existingIndexes = await redisClient.ft._list();

if (existingIndexes.length === 0) {
  const userIdIdx = await redisClient.ft.create(
    "userIdIdx",
    { "$.userId": { type: SCHEMA_FIELD_TYPE.TAG, AS: "userId" } },
    { ON: "JSON", PREFIX: "session" }
  );
  console.log(userIdIdx, ": Index is created")
}

console.log("connected to Redis");
export default redisClient;
