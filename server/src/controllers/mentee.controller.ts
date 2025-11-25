import { Request, Response } from "express";
import { getMenteeProfileService, updateMenteeProfileService, getMenteesListService } from "../services/mentee.service";
import { UpdateMenteeProfileRequest, GetMenteesQuery } from "../types/mentee.type";

const getMenteeProfile = async (req: Request, res: Response) => {
  try {
    const { menteeId } = req.params;

    if (!menteeId) {
      return res.status(400).json({
        success: false,
        message: "Mentee ID is required",
      });
    }

    const result = await getMenteeProfileService(parseInt(menteeId));

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      mentee: result.mentee,
    });
  } catch (error) {
    console.error(`Error in getMenteeProfile: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateMenteeProfile = async (req: Request, res: Response) => {
  try {
    const { menteeId } = req.params;
    const updateData: UpdateMenteeProfileRequest = req.body;

    if (!menteeId) {
      return res.status(400).json({
        success: false,
        message: "Mentee ID is required",
      });
    }

    // Check if user is authorized to update this profile
    const currentUserId = req.user?.user_id ? parseInt(req.user.user_id) : null;
    if (currentUserId !== parseInt(menteeId)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this profile",
      });
    }

    const result = await updateMenteeProfileService(parseInt(menteeId), updateData);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error(`Error in updateMenteeProfile: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getMenteesList = async (req: Request, res: Response) => {
  try {
    const query: GetMenteesQuery = {};

    if (req.query.page) {
      query.page = parseInt(req.query.page as string);
    }

    if (req.query.limit) {
      query.limit = parseInt(req.query.limit as string);
    }

    const result = await getMenteesListService(query);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(`Error in getMenteesList: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getMenteeProfile, updateMenteeProfile, getMenteesList };
