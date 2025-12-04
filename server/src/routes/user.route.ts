import {
  updateAvatar,
  changePassword,
  getMenteeInvoiceStats,
  getMentorInvoiceStats,
} from "@/controllers/user.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import { uploadImage } from "@/middlewares/upload.middleware";
import express, { Router } from "express";

const router: Router = express.Router();

router.put("/avatar", protectRoute, uploadImage.single("avatar"), updateAvatar);
router.put("/change-password", protectRoute, changePassword);
router.get("/mentee/invoice-stats", protectRoute, getMenteeInvoiceStats);
router.get("/mentor/invoice-stats", protectRoute, getMentorInvoiceStats);

export default router;
