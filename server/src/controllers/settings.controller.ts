import { Request, Response } from "express";
import {
  getUserSettingsService,
  updateUserSettingsService,
  changePasswordService,
  UpdateUserSettingsRequest,
  ChangePasswordRequest,
} from "@/services/settings.service";

export const getUserSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const result = await getUserSettingsService(userId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Error in getUserSettings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateUserSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const data: UpdateUserSettingsRequest = req.body;
    const result = await updateUserSettingsService(userId, data);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in updateUserSettings:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.user_id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const data: ChangePasswordRequest = req.body;

    if (!data.currentPassword || !data.newPassword) {
      res.status(400).json({ success: false, message: "Current password and new password are required" });
      return;
    }

    if (data.newPassword.length < 6) {
      res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
      return;
    }

    const result = await changePasswordService(userId, data);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
