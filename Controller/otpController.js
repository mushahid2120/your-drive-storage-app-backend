import {sendOtp} from "../service/sendOtp.js"

export const sendOtpApi=async(req,res,next)=>{
    try {
        const {email}=req.body;
        console.log(email)
        const result=await sendOtp(email)
        if(!result.success) return res.status(400).json({error: {otp: "Invalid or Expired OTP"}})
        return res.json({message: "OTP Send Successfully"})
    } catch (error) {
        console.log(error);
        next(error);
    }
}