import express, { json } from "express";
import authCheck,{checkAdminUser, checkRole} from "../middleware/authCheckMW.js";
import {
  getAllUsers,
  getUser,
  hardDeleteUser,
  login,
  loginWithGoogle,
  logout,
  logoutAll,
  logoutUserById,
  signup,
  softDeleteUser,
} from "../Controller/userController.js";

const router = express.Router();

router.post("/singup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/logout-all", logoutAll);

router.get("/", authCheck, getUser);

router.post('/login-with-google',loginWithGoogle)

router.get('/allusers',authCheck,checkRole,getAllUsers)

router.post('/logout-user/:userId',authCheck,checkRole,logoutUserById)

router.delete('/hard-delete-user/:userId',authCheck,hardDeleteUser)
router.delete('/soft-delete-user/:userId',authCheck,checkAdminUser,softDeleteUser)

export default router;
