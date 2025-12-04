import {
  getMentorProfile,
  updateMentorProfile,
  getMentorsList,
  getMentorStats,
  getAllPlans,
  getPlanDetails,
  createPlan,
  updatePlan,
  deletePlan,
} from "@/controllers/mentor.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/", getMentorsList);
router.get("/:mentorId/stats", getMentorStats);
router.get("/:mentorId/plans", getAllPlans);
router.get("/:mentorId/plans/:planId", getPlanDetails);
router.post("/:mentorId/plans", protectRoute, createPlan);
router.put("/:mentorId/plans/:planId", protectRoute, updatePlan);
router.delete("/:mentorId/plans/:planId", protectRoute, deletePlan);
router.get("/:mentorId", getMentorProfile);
router.put("/:mentorId", protectRoute, updateMentorProfile);

export default router;
