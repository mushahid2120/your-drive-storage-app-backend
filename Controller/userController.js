import Users from "../Model/userModel.js";
import Dir from "../Model/dirModel.js";
import mongoose from "mongoose";
import Session from "../Model/sessionModel.js";
import { verifyOtp } from "../service/sendOtp.js";
import { OAuth2Client } from "google-auth-library";
import Files from "../Model/fileModel.js";
import { rm } from "fs/promises";
import { loginSchema, signUpSchema } from "../validator/authSchemaZod.js";
import z from "zod";
// import redisClient from "../config/redis.jsames";

export const mySecret = process.env.SESSION_SECRET;
export const cookieCofig = {
      sameSite: process.env.COOKIE_SAMESITE,
      signed: true,
      secure: true,
      path: "/",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    };

export const clearCookieConfig={
    sameSite: process.env.COOKIE_SAMESITE,
    secure: true,
  }

export const signup = async (req, res, next) => {
  // const { name, email, password, otp } = req.body;

  const { success, data, error } = signUpSchema.safeParse(req.body);
  if (!success) return res.status(400).json({ error: z.flattenError(error) });
  const { name, email, password, otp } = data;

  const isValidotp = await verifyOtp(otp, email);
  if (!isValidotp)
    return res.status(400).json({ error: { otp: "Invalid or Expired OTP" } });

  const userId = new mongoose.Types.ObjectId();
  const dirId = new mongoose.Types.ObjectId();

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await Dir.insertOne(
      {
        _id: dirId,
        name: `root-${email}`,
        userId: userId,
      },
      { session }
    );

    await Users.insertOne(
      {
        _id: userId,
        name,
        email,
        password,
        rootDirId: dirId,
      },
      { session }
    );

    session.commitTransaction();

    res.json({ message: "User Created" });
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    if (error.name === "ValidationError") {
      const [errorFor] = Object.keys(error.errors);
      const errorMessage = error.errors[errorFor].properties.message;
      return res.status(401).json({ error: { [errorFor]: errorMessage } });
    } else {
      if (error.name === "MongoServerError")
        if (error.code === 11000)
          return res
            .status(401)
            .json({ error: { email: "email already Exist " } });
      if (error.code === 121) {
        return res.status(400).json({ error: "Schema Validation Error" });
      }
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    // const { email, password } = req.body;
    const { success, data, error } = loginSchema.safeParse(req.body);
    if (!success) return res.status(400).json({ error: z.flattenError(error) });
    const { email, password } = data;

    const user = await Users.findOne({ email });
    if (!user) return res.status(401).json({ error: "Invalid Credentials" });
    if (user.deleted)
      return res.status(402).json({
        error: "You accout has been delted please contact for recovery",
      });
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid Credentials" });

    const allSession = await Session.find({ userId: user.id });
    if (allSession.length > 3) await allSession[0].deleteOne();

    const session = await Session.create({ userId: user.id });

    // console.log(`@userId: {${user._id}}`);
    // const allSession = await redisClient.ft.search(
    //   "userIdIdx",
    //   `@userId: {${user._id}}`
    // );

    // if (allSession.total > 1)  await redisClient.del(allSession.documents[0].id);

    // const sessionId = crypto.randomUUID();
    // const redisKey = `session:${sessionId}`;
    // const result = await redisClient.json.set(redisKey, "$", {
    //   userId: user._id,
    // });

    

    res.cookie("sid", session.id, cookieCofig);
    return res.json({ message: "Login Successful" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const logout = async (req, res) => {
  const { sid } = req.signedCookies;
  await Session.findByIdAndDelete(sid);
  res.clearCookie("sid", clearCookieConfig);
  res.json({ message: "Logout Successfull" });
};

export const logoutAll = async (req, res) => {
  const { sid } = req.signedCookies;
  const session = await Session.findById(sid);
  await Session.deleteMany({ userId: session.userId });
  res.clearCookie("sid", clearCookieConfig);
  res.json({ message: "Logout All Successfull" });
};

export const getUser = (req, res) => {
  res.status(200).json({
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    role: req.user.role,
    capacity: req.user.capacity,
    usedStorage: req.user.rootDirId.size,
  });
};

export const loginWithGoogle = async (req, res, next) => {
  const idToken = req.body.credential;
  const client = new OAuth2Client();
  const googleUser = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  if (!googleUser)
    return res.staus(403).json({ error: "User verifaction failed" });
  const { email, picture, name, sub } = googleUser.getPayload();
  const dbUser = await Users.findOne({ email }).lean();
  if (dbUser) {
    if (dbUser.deleted)
      return res.status(402).json({
        error: "You accout has been deleted please contact for recovery",
      });
    const allSession = await Session.find({ userId: dbUser._id });
    if (allSession.length > 3) await allSession[0].deleteOne();

    const session = await Session.create({ userId: dbUser._id });


    res.cookie("sid", session.id, cookieCofig);
    return res.json({ error: "Login but user already Exist" });
  }
  const userId = new mongoose.Types.ObjectId();
  const dirId = new mongoose.Types.ObjectId();

  const dbSession = await mongoose.startSession();
  try {
    dbSession.startTransaction();
    await Dir.insertOne(
      {
        _id: dirId,
        name: `root-${email}`,
        userId: userId,
      },
      { dbSession }
    );

    await Users.insertOne(
      {
        _id: userId,
        name,
        email,
        rootDirId: dirId,
        picture,
      },
      { dbSession }
    );

    const session = await Session.create({ userId });

    res.cookie("sid", session.id, cookieCofig);

    dbSession.commitTransaction();

    return res.json({ message: "User Created" });
  } catch (error) {
    dbSession.abortTransaction();
    console.log(error);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await Users.find({ deleted: false }).lean();
    const allSession = await Session.find().lean();

    const allSessionUserId = allSession.map(({ userId }) => userId.toString());
    const allSessionUserIdSet = new Set(allSessionUserId);

    const transformedUser = allUsers.map(({ _id, name, email }) => ({
      id: _id,
      name,
      email,
      isLoggedIn: allSessionUserIdSet.has(_id.toString()),
    }));
    return res.json(transformedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const logoutUserById = async (req, res, next) => {
  try {
    const userId = req.params?.userId;
    await Session.deleteMany({ userId });
    res.status(202).end();
  } catch (error) {
    console.log(error);
    next(error)
  }
};

export const hardDeleteUser = async (req, res, next) => {
  const userId = req.params?.userId;
  console.log({ userId });
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const findfiles = await Files.find({ userId });
    for await (const file of findfiles) {
      const fileName = file._id.toString() + file.extension;
      await rm(`./GDrive/${fileName}`);
      const dirdeleteresult = await Dir.deleteMany({ userId });
    }
    await Files.deleteMany({ userId });
    await Session.deleteMany({ userId });
    await Users.findByIdAndDelete(userId);
    session.commitTransaction();
    res.status(204).end();
  } catch (error) {
    session.abortTransaction();
    console.log(error);
    next(error)
  }
};

export const softDeleteUser = async (req, res, next) => {
  try {
    const userId = req.params?.userId;
    await Session.deleteMany({ userId });
    await Users.findByIdAndUpdate(userId, { deleted: true });
    res.status(204).end();
  } catch (error) {
    console.log(error);
    next(error)
  }
};
