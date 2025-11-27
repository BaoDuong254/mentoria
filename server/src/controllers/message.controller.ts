import { Request, Response } from "express";
import {
  getMessagesByUserIdService,
  sendMessageService,
  getConversationsService,
  getUsersForSidebarService,
} from "@/services/message.service";
import { getReceiverSocketId, getIO } from "@/socket/index";

export const getUsersForSidebar = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.user_id;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const users = await getUsersForSidebarService(Number(currentUserId));

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error in getUsersForSidebar:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMessagesByUserId = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.user?.user_id;
    const otherUserId = req.params.userId ? parseInt(req.params.userId) : null;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!otherUserId || isNaN(otherUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const messages = await getMessagesByUserIdService(Number(currentUserId), otherUserId);

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error in getMessagesByUserId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const senderId = req.user?.user_id;
    const { receiver_id, content } = req.body;

    if (!senderId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID and content are required",
      });
    }

    // Save message to database
    const message = await sendMessageService(Number(senderId), Number(receiver_id), content);

    // Get receiver's socket ID and emit realtime if online
    const receiverSocketId = getReceiverSocketId(Number(receiver_id));
    if (receiverSocketId) {
      const io = getIO();
      io?.to(receiverSocketId).emit("newMessage", message);
    }

    return res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const conversations = await getConversationsService(Number(userId));

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error in getConversations:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
