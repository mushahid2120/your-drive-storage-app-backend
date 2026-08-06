import Razorpay from "razorpay";
import Subscription from "../Model/SubscriptionModel.js";
import Users from "../Model/userModel.js";

const razorpaySecret = process.env.RAZORPAY_SECRET;

export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const { payload } = req.body;
    
    const providedSignature = req.headers["x-razorpay-signature"];
    const isSignatureValid = Razorpay.validateWebhookSignature(
      JSON.stringify(req.body),
      providedSignature,
      razorpaySecret,
    );
    if (!isSignatureValid) {
      return res.status(400).json({ error: "Signature verification failed" });
    }
    const userId = req.body.payload.payment.entity.notes.userId;
    const subs = await Subscription.findOne({ userId });
    if (!payload.payment.entity.captured) {
      subs.status = "failed";
      await subs.save();
      return res.status(200).json({ message: "ok" });
    }

    if (payload.payment.entity.notes.upgrade) {
      subs.plan = "premium";
      subs.paymentDetail.razorpay_order_id=payload?.payment.entity.order_id
      subs.paymentDetail.razorpay_payment_id=payload?.payment.entity.id
      await subs.save();
      await Users.findByIdAndUpdate(userId, { capacity:  1024 * 1024 * 200});
      return res.json({message:"ok"})
    }

    let expiresAt;
    let billingCycle;
    const now = new Date();
    if (payload?.payment.entity.notes.billingCycle === "monthly") {
      billingCycle = "monthly";
      expiresAt = new Date(now.setMonth(now.getMonth() + 1));
    } else if (payload?.payment.entity.notes.billingCycle === "yearly") {
      billingCycle = "yearly";
      expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
    }

    subs.expiresAt = expiresAt;
    subs.paymentDetail.razorpay_payment_id = payload?.payment.entity.id;
    subs.status = "successfull";
    await subs.save();

    let planStorage;
    if (
      payload?.payment.entity.notes.plan === "Pro" &&
      billingCycle === "monthly"
    ) {
      planStorage = 1024 * 1024 * 100;
    } else {
      planStorage = 1024 * 1024 * 200;
    }

    await Users.findByIdAndUpdate(userId, { capacity: planStorage });

    return res.status(200).json({ message: "ok" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
