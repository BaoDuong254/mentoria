import { registerUser, verifyOTP } from "@/controllers/auth.controller";
import express from "express";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);

export default router;
