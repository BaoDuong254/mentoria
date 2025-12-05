import { Request, Response } from "express";
import { ZodError } from "zod";
import {
  listMenteesService,
  getMenteeService,
  updateMenteeService,
  deleteMenteeService,
  listMentorsService,
  getPendingMentorsService,
  getMentorService,
  updateMentorService,
  deleteMentorService,
  reviewMentorService,
  getInvoiceStatsService,
} from "@/services/admin.service";
import { sendMentorApproved, sendMentorRejected } from "@/mailtrap/mailSend";
import { ReviewAction } from "@/types/admin.type";
import { UpdateMenteeSchema, UpdateMentorSchema, ReviewMentorSchema } from "@/validation/admin.schema";

// ==================== MENTEE CONTROLLERS ====================

const listMentees = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
      });
    }

    const result = await listMenteesService(page, limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Admin] listMentees error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMentee = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const result = await getMenteeService(userId);
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Admin] getMentee error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateMentee = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    // Validate request body with Zod
    const data = UpdateMenteeSchema.parse(req.body);

    // Check if at least one field is provided
    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided for update",
      });
    }

    const result = await updateMenteeService(userId, data);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }
    console.error("[Admin] updateMentee error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteMentee = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const result = await deleteMenteeService(userId);
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Admin] deleteMentee error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==================== MENTOR CONTROLLERS ====================

const listMentors = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
      });
    }

    const result = await listMentorsService(page, limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Admin] listMentors error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPendingMentors = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
      });
    }

    const result = await getPendingMentorsService(page, limit);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Admin] getPendingMentors error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMentor = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const result = await getMentorService(userId);
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Admin] getMentor error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateMentor = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    // Validate request body with Zod
    const data = UpdateMentorSchema.parse(req.body);

    // Check if at least one field is provided
    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one field must be provided for update",
      });
    }

    const result = await updateMentorService(userId, data);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }
    console.error("[Admin] updateMentor error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteMentor = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    const result = await deleteMentorService(userId);
    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Admin] deleteMentor error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==================== REVIEW MENTOR CONTROLLER ====================

const reviewMentor = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: "Invalid id" });
    }

    // Validate action with Zod
    const { action } = ReviewMentorSchema.parse(req.body);

    const result = await reviewMentorService(userId, action as ReviewAction);
    if (!result.success) {
      return res.status(404).json(result);
    }

    // Send email notification (non-blocking, with error handling)
    const mentor = result.data;
    if (mentor && mentor.email) {
      const fullName = `${mentor.first_name} ${mentor.last_name}`;

      try {
        if (action === "accept") {
          await sendMentorApproved(fullName, mentor.email);
        } else if (action === "reject") {
          await sendMentorRejected(fullName, mentor.email);
        }
      } catch (emailError) {
        console.error("[Admin] Failed to send email:", emailError);
        // Email failure does not block successful response
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Must be 'accept' or 'reject'",
      });
    }
    console.error("[Admin] reviewMentor error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ==================== INVOICE CONTROLLER ====================

const getInvoiceStats = async (req: Request, res: Response) => {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
    const userType = req.query.userType as "mentee" | "mentor" | undefined;
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    // Validate year and month if provided
    if (year && (year < 2000 || year > 2100)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year provided",
      });
    }

    if (month && (month < 1 || month > 12)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month provided (must be between 1 and 12)",
      });
    }

    // Validate userType if userId is provided
    if (userId && (!userType || (userType !== "mentee" && userType !== "mentor"))) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing userType. Must be 'mentee' or 'mentor' when userId is provided",
      });
    }

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100",
      });
    }

    const result = await getInvoiceStatsService(year, month, userId, userType, page, limit);

    return res.status(200).json({
      success: true,
      message: "Invoice statistics retrieved successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("[Admin] getInvoiceStats error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export {
  listMentees,
  getMentee,
  updateMentee,
  deleteMentee,
  listMentors,
  getPendingMentors,
  getMentor,
  updateMentor,
  deleteMentor,
  reviewMentor,
  getInvoiceStats,
};
