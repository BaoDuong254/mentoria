import { getMentorProfile, updateMentorProfile, getMentorsList } from "@/controllers/mentor.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import express from "express";

const router = express.Router();

router.get("/", getMentorsList);
router.get("/:mentorId", getMentorProfile);
router.put("/:mentorId", protectRoute, updateMentorProfile);

export default router;
