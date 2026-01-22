import mongoose from "mongoose";

export default async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log("Connected to Database");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  mongoose.disconnect()
  console.log("Client Disconnected");
  process.exit(0);
});
