import './config/env.js';
import app from "./app.js";
import connectDB from "./config/db.js";
import redisClient from './config/redis.js';

await connectDB();
await redisClient.connect();

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log("Server is Running on port number 4000");
});