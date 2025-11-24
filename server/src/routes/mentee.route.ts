import { Router } from "express";
import { getMenteeProfile, updateMenteeProfile, getMenteesList } from "../controllers/mentee.controller";
import { protectRoute } from "../middlewares/auth.middleware";

const router: Router = Router();

router.get("/", getMenteesList);
router.get("/:menteeId", getMenteeProfile);
router.put("/:menteeId", protectRoute, updateMenteeProfile);

export default router;
