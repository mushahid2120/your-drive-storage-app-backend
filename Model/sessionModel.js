import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    createAt: {
      type: Date,
      default: Date.now,
      expires: 60 * 60*24*7,
    },
  },
  {
    strict: "throw",
  }
);

const Session=mongoose.model('session',sessionSchema);

export default Session
