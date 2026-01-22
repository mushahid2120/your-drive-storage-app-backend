import nodemailer from "nodemailer";
import Otp from "../Model/otpModel.js";
import crypto from 'crypto'

export async function sendOtp(email) {
  try {
    const otp = crypto.randomInt(1000, 10000).toString();

    const result = await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true }
    ).lean();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      auth: {
        user: "md.mushahidansari@gmail.com",
        pass: "rbyx mqyr eafa wxev",
      },
    });

    const htmlMsg = `<div>
                            <h2>Your Otp is :</h2> <br>
                            <h1><b>${otp}</b></h1>
                    </div>`;

    const info = await transporter.sendMail({
      from: '"Storage App OTP" <md.mushahidansari@gmail.com>',
      to: email,
      subject: "Storage APP OTP Verification",
      html: htmlMsg,
    });
    return { success: true };
  } catch (error) {
    console.log(error);
    return "Otp not Sent";
  }
}

export const verifyOtp = async (otp, email) => {
  try {
    const otpData = await Otp.findOne({ otp, email }).lean();
    if (otpData) return true;
    return false;
  } catch (error) {
    console.log(error);
    return false;
  }
};
