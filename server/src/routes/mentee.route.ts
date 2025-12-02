import { Router } from "express";
import {
  getMenteeProfile,
  updateMenteeProfile,
  getMenteesList,
  getMenteeSessions,
  cancelMenteeSession,
} from "../controllers/mentee.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router: Router = Router();

// Protected routes - require authentication
router.get("/sessions", protectRoute, getMenteeSessions);
router.delete("/sessions/:registrationId", protectRoute, cancelMenteeSession);

// Public routes
router.get("/", getMenteesList);
router.get("/:menteeId", getMenteeProfile);
router.put("/:menteeId", protectRoute, updateMenteeProfile);

export default router;
