import { loginUser, registerUser, verifyOTP } from "@/controllers/auth.controller";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);

export default router;
