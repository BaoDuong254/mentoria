import express, { Router } from "express";
import { createCheckoutSession, handleWebhook } from "@/controllers/pay.controller";
import { protectRoute } from "@/middlewares/auth.middleware";

const router: Router = express.Router();

router.post("/checkout-session", protectRoute, createCheckoutSession);
router.post("/webhook", handleWebhook);

export default router;
