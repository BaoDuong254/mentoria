import { createSlot, getSlots, getSlot, updateSlot, deleteSlot } from "@/controllers/slot.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/plans/:planId", getSlots);
router.get("/plans/:planId/slot", getSlot);
router.post("/plans/:planId", protectRoute, createSlot);
router.put("/plans/:planId/slot", protectRoute, updateSlot);
router.delete("/plans/:planId/slot", protectRoute, deleteSlot);

export default router;
