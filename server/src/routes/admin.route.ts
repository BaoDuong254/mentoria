import { Router } from "express";
import * as adminController from "@/controllers/admin.controller";

const router = Router();

// Mentees
router.get("/mentees", adminController.listMentees);
router.get("/mentees/:id", adminController.getMentee);
router.put("/mentees/:id", adminController.updateMentee);
router.delete("/mentees/:id", adminController.deleteMentee);

// Mentors
router.get("/mentors", adminController.listMentors);
router.get("/mentors/pending", adminController.getPendingMentors);
router.get("/mentors/:id", adminController.getMentor);
router.put("/mentors/:id", adminController.updateMentor);
router.delete("/mentors/:id", adminController.deleteMentor);

// Review mentor (accept/reject)
router.post("/mentors/:id/review", adminController.reviewMentor);

export default router;
