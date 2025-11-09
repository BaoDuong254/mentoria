import { getMenteeProfileService, updateMenteeProfileService, getMenteesListService } from "@/services/mentee.service";
import { UpdateMenteeProfileRequest, GetMenteesQuery } from "@/types/mentee.type";
import { Request, Response } from "express";
import logger from "@/utils/logger";

const getMenteeProfile = async (req: Request, res: Response) => {
  try {
    const { menteeId } = req.params;

    // Validate menteeId is a number
    if (!menteeId) {
      return res.status(400).json({
        success: false,
        message: "Mentee ID is required",
      });
    }

    const menteeIdNum = parseInt(menteeId);
    if (isNaN(menteeIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentee ID",
      });
    }

    const result = await getMenteeProfileService(menteeIdNum);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentee profile retrieved successfully",
      data: result.mentee,
    });
  } catch (error) {
    logger.error(`Error in getMenteeProfile controller: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateMenteeProfile = async (req: Request, res: Response) => {
  try {
    const { menteeId } = req.params;

    // Validate menteeId is a number
    if (!menteeId) {
      return res.status(400).json({
        success: false,
        message: "Mentee ID is required",
      });
    }

    const menteeIdNum = parseInt(menteeId);
    if (isNaN(menteeIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentee ID",
      });
    }

    // Check if user is authorized to update this profile
    if (req.user && parseInt(req.user.user_id) !== menteeIdNum) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile",
      });
    }

    const updateData: UpdateMenteeProfileRequest = req.body;

    // Validate sex if provided
    if (updateData.sex && !["Male", "Female"].includes(updateData.sex)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sex value. Must be 'Male' or 'Female'",
      });
    }

    const result = await updateMenteeProfileService(menteeIdNum, updateData);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    logger.error(`Error in updateMenteeProfile controller: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMenteesList = async (req: Request, res: Response) => {
  try {
    // Parse query parameters
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

    // Validate page and limit
    if (page !== undefined && (isNaN(page) || page < 1)) {
      return res.status(400).json({
        success: false,
        message: "Invalid page number. Must be a positive integer.",
      });
    }

    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      return res.status(400).json({
        success: false,
        message: "Invalid limit. Must be between 1 and 100.",
      });
    }

    // Build query object with only defined values
    const query: GetMenteesQuery = {};
    if (page !== undefined) query.page = page;
    if (limit !== undefined) query.limit = limit;

    const result = await getMenteesListService(query);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    logger.error(`Error in getMenteesList controller: ${error}`);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getMenteeProfile, updateMenteeProfile, getMenteesList };
