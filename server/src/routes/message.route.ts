import express, { Router } from "express";
import {
  getMessagesByUserId,
  sendMessage,
  getConversations,
  getUsersForSidebar,
} from "@/controllers/message.controller";
import { protectRoute } from "@/middlewares/auth.middleware";

const router: Router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/conversations", protectRoute, getConversations);
router.get("/:userId", protectRoute, getMessagesByUserId);
router.post("/", protectRoute, sendMessage);

export default router;
