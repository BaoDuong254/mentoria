import express, { Router } from "express";
import {
  getMeetingsForMentee,
  getMeetingsForMentor,
  getMeetingById,
  updateMeetingLocation,
  updateMeetingStatus,
  updateMeetingReviewLink,
} from "@/controllers/meeting.controller";
import { protectRoute } from "@/middlewares/auth.middleware";

const router: Router = express.Router();

router.get("/mentee", protectRoute, getMeetingsForMentee);
router.get("/mentor", protectRoute, getMeetingsForMentor);
router.get("/:meetingId", protectRoute, getMeetingById);
router.patch("/:meetingId/location", protectRoute, updateMeetingLocation);
router.patch("/:meetingId/status", protectRoute, updateMeetingStatus);
router.patch("/:meetingId/review-link", protectRoute, updateMeetingReviewLink);

export default router;
