import { Router } from "express";
import { chatWithBot, chatbotHealthCheck } from "@/controllers/chatbot.controller";

const router: Router = Router();

router.post("/chat", chatWithBot);
router.get("/health", chatbotHealthCheck);

export default router;
