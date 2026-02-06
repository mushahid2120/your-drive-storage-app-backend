import Users from "../Model/userModel.js";
import {sendOtp} from "../service/sendOtp.js"

export const sendOtpApi=async(req,res,next)=>{
    try {
        const {email}=req.body;
        const userData=await Users.findOne({email}).lean()
        if(userData){
            return res.status(401).json({error:{otp:"Email already Exist "}})
        }
        const result=await sendOtp(email)
        if(!result.success) {
            return res.status(400).json({error: {otp: "Invalid Email"}})}
        return res.json({message: "OTP Send Successfully"})
    } catch (error) {
        console.log(error);
        next(error);
    }
}