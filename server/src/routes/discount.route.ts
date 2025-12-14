import express, { Router } from "express";
import { protectRoute } from "@/middlewares/auth.middleware";
import { getAllDiscounts, getBestDiscount } from "@/controllers/discount.controller";

const router: Router = express.Router();

router.get("/best", protectRoute, getBestDiscount);
router.get("/all", protectRoute, getAllDiscounts);

export default router;
