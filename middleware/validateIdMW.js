import mongoose from "mongoose";

export default function(req,res,next,id){
    if(id &&  !mongoose.Types.ObjectId.isValid(id))
        return res.status(400).json({error:"Invalid ID"});
    next();
}

export function domPurifier(req,res,next){
    
}