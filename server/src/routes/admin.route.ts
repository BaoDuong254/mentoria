import {
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
} from "@/controllers/admin.controller";
import { protectRoute } from "@/middlewares/auth.middleware";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/mentees", protectRoute, listMentees);
router.get("/mentees/:id", protectRoute, getMentee);
router.put("/mentees/:id", protectRoute, updateMentee);
router.delete("/mentees/:id", protectRoute, deleteMentee);

router.get("/mentors", protectRoute, listMentors);
router.get("/mentors/pending", protectRoute, getPendingMentors);
router.get("/mentors/:id", protectRoute, getMentor);
router.put("/mentors/:id", protectRoute, updateMentor);
router.delete("/mentors/:id", protectRoute, deleteMentor);

router.post("/mentors/:id/review", protectRoute, reviewMentor);

export default router;
