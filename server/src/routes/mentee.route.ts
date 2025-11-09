import { getMenteeProfile, updateMenteeProfile, getMenteesList } from "@/controllers/mentee.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.get("/", getMenteesList);
router.get("/:menteeId", getMenteeProfile);
router.put("/:menteeId", protectRoute, updateMenteeProfile);

export default router;
