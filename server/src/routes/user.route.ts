import { updateAvatar } from "@/controllers/user.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import { uploadImage } from "@/middlewares/upload.middleware";
import express from "express";

const router = express.Router();

router.put("/avatar", protectRoute, uploadImage.single("avatar"), updateAvatar);

export default router;
