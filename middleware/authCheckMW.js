import { clearCookieConfig } from "../Controller/userController.js";
import Session from "../Model/sessionModel.js";
import Users from "../Model/userModel.js";

export default async function checkAuth(req, res, next) {
  try {
    const { sid } = req.signedCookies;
    //signature matched (true) if failed (false)
    if (sid === false)
      res.clearCookie("sid", clearCookieConfig);
    if (!sid) return res.status(401).json({ error: "Not Logged In..." });

    const session = await Session.findById(sid);
    // const session=await redisClient.json.get(`session:${sid}`)

    if (!session) {
      res.clearCookie("sid", clearCookieConfig);
      return res
        .status(401)
        .json({ error: "Session Expired or Invalid Session" });
    }

    //finding User from database
    const user = await Users.findOne({ _id: session.userId, deleted: false })
      .populate({ path: "rootDirId" ,select: "_id size"})
      .lean();
    if (!user) return res.status(401).json({ error: "Not Logged In" });
    req.user = user;

    next();
  } catch (error) {
    console.log(error);
    if (error.name === "CastError")
      return res.status(400).json({ error: "Invalid UserId" });
    next(error);
  }
}

export const checkRole = (req, res, next) => {
  if (req.user.role !== "User") return next();
  res.status(403).json({ error: "You Can not Access all User Data" });
};
export const checkAdminUser = async (req, res, next) => {
  const userId = req.params?.userId;
  const user = await Users.findById(userId).lean();

  if (user?.role !== "Admin") {
    return next();
  } else {
    res.status(403).json({ error: "You Can not Delete your own Account" });
  }
};
