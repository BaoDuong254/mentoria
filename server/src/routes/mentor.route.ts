import { getMentorProfile } from "@/controllers/mentor.controller";
import express from "express";

const router = express.Router();

router.get("/:mentorId", getMentorProfile);

export default router;
