import { Router } from "express";
import { getUserSettings, updateUserSettings, changePassword } from "@/controllers/settings.controller";
import { protectRoute } from "@/middlewares/auth.middleware";

const router = Router();

router.get("/", protectRoute, getUserSettings);
router.put("/", protectRoute, updateUserSettings);
router.put("/change-password", protectRoute, changePassword);

export default router;
