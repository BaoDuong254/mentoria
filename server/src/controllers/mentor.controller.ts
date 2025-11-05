import { getMentorProfileService, updateMentorProfileService, getMentorsListService } from "@/services/mentor.service";
import { UpdateMentorProfileRequest, GetMentorsQuery } from "@/types/mentor.type";
import { Request, Response } from "express";

const getMentorProfile = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    const result = await getMentorProfileService(mentorIdNum);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Mentor profile retrieved successfully",
      data: result.mentor,
    });
  } catch (error) {
    console.error("Error in getMentorProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateMentorProfile = async (req: Request, res: Response) => {
  try {
    const { mentorId } = req.params;

    // Validate mentorId is a number
    if (!mentorId) {
      return res.status(400).json({
        success: false,
        message: "Mentor ID is required",
      });
    }

    const mentorIdNum = parseInt(mentorId);
    if (isNaN(mentorIdNum)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mentor ID",
      });
    }

    // Check if user is authorized to update this profile
    if (req.user && parseInt(req.user.user_id) !== mentorIdNum) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this profile",
      });
    }

    const updateData: UpdateMentorProfileRequest = req.body;

    // Validate sex if provided
    if (updateData.sex && !["Male", "Female"].includes(updateData.sex)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sex value. Must be 'Male' or 'Female'",
      });
    }

    // Validate responseTime if provided
    if (updateData.responseTime !== undefined && updateData.responseTime < 0) {
      return res.status(400).json({
        success: false,
        message: "Response time must be a non-negative number",
      });
    }

    const result = await updateMentorProfileService(mentorIdNum, updateData);

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
    console.error("Error in updateMentorProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMentorsList = async (req: Request, res: Response) => {
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
    const query: GetMentorsQuery = {};
    if (page !== undefined) query.page = page;
    if (limit !== undefined) query.limit = limit;

    const result = await getMentorsListService(query);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error("Error in getMentorsList controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getMentorProfile, updateMentorProfile, getMentorsList };
