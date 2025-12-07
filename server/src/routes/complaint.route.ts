import express, { Router } from "express";
import {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaintStatus,
  checkMeetingExpiredPending,
  getComplaintsForMentor,
  getComplaintByMeetingId,
} from "@/controllers/complaint.controller";
import { protectRoute } from "@/middlewares/auth.middleware";

const router: Router = express.Router();

// Mentee routes
router.post("/", protectRoute, createComplaint);
router.get("/my", protectRoute, getMyComplaints);

// Mentor routes
router.get("/mentor", protectRoute, getComplaintsForMentor);

// Check if meeting is expired pending (for showing complaint button)
router.get("/check-expired/:meetingId", protectRoute, checkMeetingExpiredPending);

// Get complaint by meeting ID
router.get("/meeting/:meetingId", protectRoute, getComplaintByMeetingId);

// Admin routes
router.get("/", protectRoute, getAllComplaints);
router.get("/:complaintId", protectRoute, getComplaintById);
router.put("/:complaintId/status", protectRoute, updateComplaintStatus);

export default router;
