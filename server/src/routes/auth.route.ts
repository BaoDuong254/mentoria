import { loginUser, logoutUser, registerUser, verifyOTP } from "@/controllers/auth.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/logout", protectRoute, logoutUser);

export default router;
