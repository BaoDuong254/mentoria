import { Request, Response } from "express";
import { Role } from "@/constants/type";
import {
  createComplaintService,
  getAllComplaintsService,
  getComplaintsByMenteeIdService,
  getComplaintByIdService,
  updateComplaintStatusService,
  checkMeetingExpiredPendingService,
  getComplaintsByMentorIdService,
  getComplaintByMeetingIdService,
} from "@/services/complaint.service";

/**
 * Create a new complaint (mentee only)
 */
export const createComplaint = async (req: Request, res: Response) => {
  try {
    const menteeId = req.user?.user_id;
    const { meeting_id, content } = req.body;

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
        message: "Only mentees can file complaints",
      });
    }

    if (!meeting_id || typeof meeting_id !== "number") {
      return res.status(400).json({
        success: false,
        message: "Meeting ID is required",
      });
    }

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Complaint content is required",
      });
    }

    const result = await createComplaintService(meeting_id, Number(menteeId), content.trim());

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error("Error in createComplaint:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get all complaints (admin only)
 */
export const getAllComplaints = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const status = req.query.status as string | undefined;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify user is an admin
    if (req.user?.role !== Role.Admin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can view all complaints",
      });
    }

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    // Validate status if provided
    const validStatuses = ["Pending", "Reviewed", "Resolved", "Rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter",
      });
    }

    const result = await getAllComplaintsService(page, limit, status);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllComplaints:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get complaints by mentee (mentee can see their own complaints)
 */
export const getMyComplaints = async (req: Request, res: Response) => {
  try {
    const menteeId = req.user?.user_id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const status = req.query.status as string | undefined;

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
        message: "Only mentees can view their complaints",
      });
    }

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    // Validate status if provided
    const validStatuses = ["Pending", "Reviewed", "Resolved", "Rejected"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter",
      });
    }

    const result = await getComplaintsByMenteeIdService(Number(menteeId), page, limit, status);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getMyComplaints:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const complaintId = req.params.complaintId ? parseInt(req.params.complaintId) : null;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!complaintId || isNaN(complaintId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    const complaint = await getComplaintByIdService(complaintId);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: "Complaint not found",
      });
    }

    // Only admin or the mentee who filed the complaint can view it
    if (req.user?.role !== Role.Admin && complaint.mentee_id !== Number(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this complaint",
      });
    }

    return res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    console.error("Error in getComplaintById:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Update complaint status (admin only)
 */
export const updateComplaintStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const complaintId = req.params.complaintId ? parseInt(req.params.complaintId) : null;
    const { status, admin_response } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Verify user is an admin
    if (req.user?.role !== Role.Admin) {
      return res.status(403).json({
        success: false,
        message: "Only admins can update complaint status",
      });
    }

    if (!complaintId || isNaN(complaintId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid complaint ID",
      });
    }

    // Validate status
    const validStatuses = ["Reviewed", "Resolved", "Rejected"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: Reviewed, Resolved, Rejected",
      });
    }

    const result = await updateComplaintStatusService(complaintId, status, admin_response);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in updateComplaintStatus:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Check if a meeting is expired pending (for showing complaint button)
 */
export const checkMeetingExpiredPending = async (req: Request, res: Response) => {
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

    const result = await checkMeetingExpiredPendingService(meetingId);

    // Disable caching for this dynamic endpoint
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    res.set("Surrogate-Control", "no-store");

    return res.status(200).json({
      success: true,
      isExpired: result.isExpired,
      meetingInfo: result.meetingInfo,
    });
  } catch (error) {
    console.error("Error in checkMeetingExpiredPending:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get complaints by mentor (mentor can see complaints against them)
 */
export const getComplaintsForMentor = async (req: Request, res: Response) => {
  try {
    const mentorId = req.user?.user_id;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

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
        message: "Only mentors can view their complaints",
      });
    }

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const result = await getComplaintsByMentorIdService(Number(mentorId), page, limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getComplaintsForMentor:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * Get complaint by meeting ID
 */
export const getComplaintByMeetingId = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.user_id;
    const { meetingId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!meetingId || isNaN(parseInt(meetingId))) {
      return res.status(400).json({
        success: false,
        message: "Invalid meeting ID",
      });
    }

    const result = await getComplaintByMeetingIdService(parseInt(meetingId));
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getComplaintByMeetingId:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
