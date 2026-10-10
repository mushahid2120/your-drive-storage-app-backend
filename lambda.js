import serverless from 'serverless-http'
import './service/aws_s3.js'
import connectDB from "./config/db.js";
import app from "./app.js"
import redisClient from './config/redis.js';

await connectDB();
await redisClient.connect();

export const handler = serverless(app);