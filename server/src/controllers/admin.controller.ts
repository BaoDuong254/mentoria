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
} from "@/services/admin.service";
import { sendMentorApproved, sendMentorRejected } from "@/mailtrap/mailSend";
import { ReviewAction } from "@/types/admin.type";
import { UpdateMenteeSchema, UpdateMentorSchema, ReviewMentorSchema } from "@/validation/admin.schema";

// ==================== MENTEE CONTROLLERS ====================

const listMentees = async (_req: Request, res: Response) => {
  try {
    const result = await listMenteesService();
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
    if (!("first_name" in data) && !("last_name" in data) && !("email" in data) && !("goal" in data)) {
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

const listMentors = async (_req: Request, res: Response) => {
  try {
    const result = await listMentorsService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Admin] listMentors error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPendingMentors = async (_req: Request, res: Response) => {
  try {
    const result = await getPendingMentorsService();
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
};
