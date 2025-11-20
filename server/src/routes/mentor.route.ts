import { getMentorProfile, updateMentorProfile, getMentorsList, getMentorStats } from "@/controllers/mentor.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/", getMentorsList);
router.get("/:mentorId/stats", getMentorStats);
router.get("/:mentorId", getMentorProfile);
router.put("/:mentorId", protectRoute, updateMentorProfile);

export default router;
