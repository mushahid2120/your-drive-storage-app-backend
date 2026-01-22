import Otp from "../Model/otpModel.js";
import crypto from "crypto";
import axios from 'axios'

export async function sendOtp(email) {
  try {
    const otp = crypto.randomInt(1000, 10000).toString();

    const result = await Otp.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true }
    ).lean();

    const htmlMsg = `<div>
                            <h2>Your Otp is :</h2> <br>
                            <h1><b>${otp}</b></h1>
                    </div>`;

    const response = await sendEmail(email, "Storage App OTP", htmlMsg);

    return response;
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function sendEmail(to, subject, html) {
  try {
    const res = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Storage App",
          email: process.env.SENDER_EMAIL,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key":process.env.BREVO_KEY_ID,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log(res)
    return { success: true, data: res.data };
  } catch (error) {
    console.log(error);
    console.error("Brevo email error:", error.response?.data || error.message);
    return { success: false, error: error.response?.data };
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
