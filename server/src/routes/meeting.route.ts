import express, { Router } from "express";
import {
  getMeetingsForMentee,
  getMeetingsForMentor,
  getMeetingById,
  updateMeetingLocation,
  updateMeetingStatus,
  updateMeetingReviewLink,
  cancelMeeting,
  deleteMeetingPermanently,
} from "@/controllers/meeting.controller";
import { protectRoute } from "@/middlewares/auth.middleware";

const router: Router = express.Router();

router.get("/mentee", protectRoute, getMeetingsForMentee);
router.get("/mentor", protectRoute, getMeetingsForMentor);
router.get("/:meetingId", protectRoute, getMeetingById);
router.put("/:meetingId/location", protectRoute, updateMeetingLocation);
router.put("/:meetingId/status", protectRoute, updateMeetingStatus);
router.put("/:meetingId/review-link", protectRoute, updateMeetingReviewLink);
router.delete("/:meetingId", protectRoute, cancelMeeting);
router.delete("/:meetingId/permanent", protectRoute, deleteMeetingPermanently);

export default router;
