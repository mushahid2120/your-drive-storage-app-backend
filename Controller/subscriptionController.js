import Razorpay from "razorpay";
import Subscription from "../Model/SubscriptionModel.js";
import Users from "../Model/userModel.js";

const availableBillingCycle = ["monthly", "yearly"];
const availablePlan = ["Pro", "Premium"];

export const createSubscription = async (req, res, next) => {
  try {
    const { billingCycle, plan } = req.body;
    const userId = req.user._id;
    if (
      !availableBillingCycle.includes(billingCycle) ||
      !availablePlan.includes(plan)
    ) {
      res.status(404).json({ error: "invalid billingCycle or plan" });
    }

    let subs = await Subscription.findOne({ userId });

    const rzpIntance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    let orderAmount = 0;
    if (billingCycle === "monthly") {
      if (plan === "Pro") {
        orderAmount = 266;
      } else orderAmount = 699;
    } else {
      if (plan === "Pro") {
        orderAmount = 2999;
      } else orderAmount = 6999;
    }

    const order = await rzpIntance.orders.create({
      amount: orderAmount * 100,
      currency: "INR",
      notes: {
        userId,
        plan,
        billingCycle,
        upgrade:false
      },
    });

    if (!subs) {
      subs = new Subscription({
        userId,
      });
    }
    subs.plan = plan.toLowerCase();
    subs.billingCycle = billingCycle;
    subs.paymentDetail = { razorpay_order_id: order.id };

    const subsResult = await subs.save();

    res.json({ orderid: order.id });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const upgradeSubscription = async (req, res, next) => {
  try {
    const userId=req.user._id;
    const subs=await Subscription.findOne({userId})

    const rzpIntance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET_KEY,
    });

    const order = await rzpIntance.orders.create({
      amount: subs.billingCycle==="monthly" ?400 * 100:4000*100,
      currency: "INR",
      notes: {
        userId,
        plan:"Premium",
        billingCycle:subs.billingCycle,
        upgrade:true
      },
    });

    res.json({orderid:order.id})
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const subs = await Subscription.findOne({ userId }).lean();
    if (!subs) {
      return res.json({ plan: "Free" });
    }
    return res.json(subs);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const cancelSubscription=async(req,res,next)=>{
  try {const userId=req.user._id
    const subs=await Subscription.findOneAndDelete({userId})
    if(!subs){
      return res.status(404).json({error:"No Subscription found"})
    }
    const user=await Users.findByIdAndUpdate(userId,{capacity:1024*1024*50})
    return res.json({message:"Your Subscription has been canceled"})
  } catch (error) {
    console.log(error)
    next(error)
  }
}
