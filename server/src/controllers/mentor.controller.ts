import { getMentorProfileService } from "@/services/mentor.service";
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

export { getMentorProfile };
