import Users from "../Model/userModel.js";
import {sendOtp} from "../service/sendOtp.js"

export const sendOtpApi=async(req,res,next)=>{
    try {
        const {email}=req.body;
        console.log(email)
        const userData=await Users.findOne({email}).lean()
        console.log(userData)
        if(userData){
            console.log(`${userData.email} is already exist otp will not send`)
            return res.status(401).json({error:{otp:"Email already Exist "}})
        }
        const result=await sendOtp(email)
        console.log(result)
        if(!result.success) {
            console.log(`${email} wrong email`)
            return res.status(400).json({error: {otp: "Invalid Email"}})}
        console.log(`${email}  OTP SEND SUCCESSFULLY`)
        return res.json({message: "OTP Send Successfully"})
    } catch (error) {
        console.log(error);
        next(error);
    }
}