import { Request, Response } from "express";
import {
  getMeetingsByMenteeIdService,
  getMeetingsByMentorIdService,
  getMeetingByIdService,
  updateMeetingLocationService,
  updateMeetingStatusService,
  updateMeetingReviewLinkService,
} from "@/services/meeting.service";
import { Role } from "@/constants/type";

export const getMeetingsForMentee = async (req: Request, res: Response) => {
  try {
    const menteeId = req.user?.user_id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

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

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
      });
    }

    const result = await getMeetingsByMenteeIdService(Number(menteeId), page, limit);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getMeetingsForMentee:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getMeetingsForMentor = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user?.user_id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

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

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
      });
    }

    const result = await getMeetingsByMentorIdService(Number(mentorId), page, limit);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getMeetingsForMentor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

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

/**
 * Update meeting review link
 * Only mentor can update this
 */
export const updateMeetingReviewLink = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user?.user_id;
    const meetingId = req.params.meetingId ? parseInt(req.params.meetingId) : null;
    const { reviewLink } = req.body;

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
        message: "Access denied. Only mentors can update review link.",
      });
    }

    if (!meetingId || isNaN(meetingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    if (!reviewLink || typeof reviewLink !== "string") {
      return res.status(400).json({
        success: false,
        message: "Review link is required",
      });
    }

    const updatedMeeting = await updateMeetingReviewLinkService(meetingId, Number(mentorId), reviewLink);

    if (!updatedMeeting) {
      return res.status(404).json({
        success: false,
        message: "Meeting not found or you do not have permission to update it",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review link updated successfully",
      data: updatedMeeting,
    });
  } catch (error) {
    console.error("Error in updateMeetingReviewLink:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
