import { Request, Response } from "express";
import * as adminService from "@/services/admin.service";
import { sendMentorApproved, sendMentorRejected } from "@/mailtrap/mailSend";

const listMentees = async (_req: Request, res: Response) => {
  try {
    const data = await adminService.listMentees();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMentee = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid id" });
    const data = await adminService.getMentee(userId);
    if (!data) return res.status(404).json({ success: false, message: "Mentee not found" });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateMentee = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid id" });
    await adminService.updateMentee(userId, req.body);
    return res.status(200).json({ success: true, message: "Mentee updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteMentee = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid id" });
    const result = await adminService.deleteMentee(userId);
    if (!result.success) return res.status(404).json({ success: false, message: result.message || "Mentee not found" });
    return res.status(200).json({ success: true, message: "Mentee deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Mentor handlers
const listMentors = async (_req: Request, res: Response) => {
  try {
    const data = await adminService.listMentors();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getPendingMentors = async (_req: Request, res: Response) => {
  try {
    const data = await adminService.getPendingMentors();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getMentor = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid id" });
    const data = await adminService.getMentor(userId);
    if (!data) return res.status(404).json({ success: false, message: "Mentor not found" });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateMentor = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid id" });
    await adminService.updateMentor(userId, req.body);
    return res.status(200).json({ success: true, message: "Mentor updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteMentor = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid id" });
    const result = await adminService.deleteMentor(userId);
    if (!result.success) return res.status(404).json({ success: false, message: result.message || "Mentor not found" });
    return res.status(200).json({ success: true, message: "Mentor deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// review mentor profile: action = accept | reject
const reviewMentor = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) return res.status(400).json({ success: false, message: "Invalid id" });
    const { action } = req.body as { action: string };
    if (!action || (action !== "accept" && action !== "reject")) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const result = await adminService.reviewMentor(userId, action as "accept" | "reject");
    if (!result.success) return res.status(404).json({ success: false, message: result.message || "Not found" });

    // Send mail accordingly. For accept, mentor info is present in result. For reject, we ensured mentor is returned before deletion.
    const mentor = (result as any).mentor;
    if (action === "accept") {
      if (mentor && mentor.email) await sendMentorApproved(`${mentor.first_name} ${mentor.last_name}`, mentor.email);
      return res.status(200).json({ success: true, message: "Mentor accepted" });
    }

    if (action === "reject") {
      if (mentor && mentor.email) await sendMentorRejected(`${mentor.first_name} ${mentor.last_name}`, mentor.email);
      return res.status(200).json({ success: true, message: "Mentor rejected and removed" });
    }

    return res.status(400).json({ success: false, message: "Unknown error" });
  } catch (error) {
    console.error(error);
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
