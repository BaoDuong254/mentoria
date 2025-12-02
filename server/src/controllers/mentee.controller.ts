import { Request, Response } from "express";
import {
  getMenteeProfileService,
  updateMenteeProfileService,
  getMenteesListService,
  getMenteeSessionsService,
} from "../services/mentee.service";
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

// Get all sessions for the logged-in mentee
const getMenteeSessions = async (req: Request, res: Response) => {
  try {
    // Get mentee ID from authenticated user
    const menteeId = req.user?.user_id;

    if (!menteeId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const result = await getMenteeSessionsService(parseInt(menteeId));

    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message,
      });
    }

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    console.error(`Error in getMenteeSessions: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Cancel a booking (delete a pending session)
const cancelMenteeSession = async (req: Request, res: Response) => {
  try {
    const menteeId = req.user?.user_id;
    const { registrationId } = req.params;

    if (!menteeId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    if (!registrationId) {
      return res.status(400).json({
        success: false,
        message: "Registration ID is required",
      });
    }

    // TODO: Implement cancellation logic
    // For now, return success
    res.status(200).json({
      success: true,
      message: "Session cancelled successfully",
    });
  } catch (error) {
    console.error(`Error in cancelMenteeSession: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getMenteeSessions, cancelMenteeSession };
