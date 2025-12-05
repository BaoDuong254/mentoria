import { Request, Response } from "express";
import {
  getMeetingsByMenteeIdService,
  getMeetingsByMentorIdService,
  getMeetingByIdService,
  updateMeetingLocationService,
  updateMeetingStatusService,
} from "@/services/meeting.service";
import { Role } from "@/constants/type";

/**
 * Get all meetings for the current mentee
 */
export const getMeetingsForMentee = async (req: Request, res: Response) => {
  try {
    const menteeId = req.user?.user_id;

    if (!menteeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify user is a mentee
    if (req.user?.role !== Role.Mentee) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only mentees can access this resource.",
      });
    }

    const meetings = await getMeetingsByMenteeIdService(Number(menteeId));

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error("Error in getMeetingsForMentee:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get all meetings for the current mentor
 */
export const getMeetingsForMentor = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user?.user_id;

    if (!mentorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify user is a mentor
    if (req.user?.role !== Role.Mentor) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only mentors can access this resource.",
      });
    }

    const meetings = await getMeetingsByMentorIdService(Number(mentorId));

    return res.status(200).json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error("Error in getMeetingsForMentor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get a single meeting by ID
 */
export const getMeetingById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const meetingId = req.params.meetingId ? parseInt(req.params.meetingId) : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!meetingId || isNaN(meetingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    const meeting = await getMeetingByIdService(meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found",
      });
    }

    // Verify user is part of this meeting (either mentor or mentee)
    if (meeting.mentor_id !== Number(userId) && meeting.mentee_id !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You are not part of this meeting.",
      });
    }

    return res.status(200).json({
      success: true,
      data: meeting,
    });
  } catch (error) {
    console.error("Error in getMeetingById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update meeting location (add Google Meet link)
 * Only mentor can update this
 */
export const updateMeetingLocation = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user?.user_id;
    const meetingId = req.params.meetingId ? parseInt(req.params.meetingId) : null;
    const { location } = req.body;

    if (!mentorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify user is a mentor
    if (req.user?.role !== Role.Mentor) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only mentors can update meeting location.",
      });
    }

    if (!meetingId || isNaN(meetingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    if (!location || typeof location !== "string") {
      return res.status(400).json({
        success: false,
        message: "Location (Google Meet link) is required",
      });
    }

    const updatedMeeting = await updateMeetingLocationService(meetingId, Number(mentorId), location);

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or you do not have permission to update it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meeting location updated successfully. Status changed to Scheduled.",
      data: updatedMeeting,
    });
  } catch (error) {
    console.error("Error in updateMeetingLocation:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update meeting status (Completed or Cancelled)
 * Only mentor can update this
 */
export const updateMeetingStatus = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user?.user_id;
    const meetingId = req.params.meetingId ? parseInt(req.params.meetingId) : null;
    const { status } = req.body;

    if (!mentorId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify user is a mentor
    if (req.user?.role !== Role.Mentor) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only mentors can update meeting status.",
      });
    }

    if (!meetingId || isNaN(meetingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    // Validate status
    const validStatuses = ["Scheduled", "Completed", "Cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const updatedMeeting = await updateMeetingStatusService(meetingId, Number(mentorId), status);

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or you do not have permission to update it",
      });
    }

    return res.status(200).json({
      success: true,
      message: `Meeting status updated to ${status}`,
      data: updatedMeeting,
    });
  } catch (error) {
    console.error("Error in updateMeetingStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
