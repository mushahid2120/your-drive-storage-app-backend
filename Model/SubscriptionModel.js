import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    plan: {
      type: String,
      enum: [ "pro", "premium"],
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
    },
    status: {
      type: String,
      enum: ["failed", "successfull", "processing"],
      default: "processing",
    },
    paymentDetail: {
      razorpay_order_id: { type: String },
      razorpay_payment_id: { type: String },
    },
    expiresAt: {
      type: Date,
      expires: null, 
    },
  },
  {
    strict: "throw",
    timestamps: true,
  },
);
const Subscription = mongoose.model("Subscription", subscriptionSchema);

export default Subscription;
