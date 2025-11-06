import {
  forgotPassword,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  registerMentor,
  resetPassword,
  verifyOTP,
  resendOTP,
} from "@/controllers/auth.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import { upload } from "@/middlewares/upload.middleware";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/mentor-register", upload.single("cv"), registerMentor);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);
router.post("/logout", protectRoute, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/me", protectRoute, getMe);

export default router;
