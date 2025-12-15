import { Request, Response } from "express";
import { geminiChatbotService } from "@/services/chatbot.service";
import { ChatRequest, ChatResponse } from "@/types/chatbot.type";
import logger from "@/utils/logger";

export const chatWithBot = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history, userId, userRole } = req.body as ChatRequest;

    // Validate input
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Message is required and must be a non-empty string",
      } as ChatResponse);
      return;
    }

    // Optional: Get user context from auth middleware if available
    // You can extend this to use req.user if you have authentication
    const authenticatedUserId = req.user?.user_id ? parseInt(req.user.user_id) : userId;
    const authenticatedUserRole = req.user?.role || userRole;

    logger.info("Chatbot request received", {
      userId: authenticatedUserId,
      userRole: authenticatedUserRole,
      messageLength: message.length,
      historyLength: history?.length || 0,
    });

    // Call the Gemini service
    const result = await geminiChatbotService.chat(message, history || [], authenticatedUserId, authenticatedUserRole);

    // Prepare response
    const response: ChatResponse = {
      success: true,
      message: "Response generated successfully",
      response: result.response,
      functionCalls: result.functionCalls.map((fc) => ({
        name: fc.name,
        args: fc.args,
        result: fc.result,
      })),
    };

    logger.info("Chatbot response generated", {
      userId: authenticatedUserId,
      functionCallsCount: result.functionCalls.length,
      responseLength: result.response.length,
    });

    res.status(200).json(response);
  } catch (error: unknown) {
    logger.error("Error in chatbot controller:", error);

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while processing your request",
    } as ChatResponse);
  }
};

export const chatbotHealthCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Check if Gemini API key is configured
    const isConfigured = !!process.env.GEMINI_API_KEY;

    res.status(200).json({
      success: true,
      message: "Chatbot service is operational",
      configured: isConfigured,
    });
  } catch (error: unknown) {
    logger.error("Error in chatbot health check:", error);
    res.status(500).json({
      success: false,
      message: "Chatbot service health check failed",
    });
  }
};
