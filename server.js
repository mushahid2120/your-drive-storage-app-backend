import './config/env.js';
import app from "./app.js";
import connectDB from "./config/db.js";

await connectDB();

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log("Server is Running on port number 4000");
});