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
  getInvoiceStats,
} from "@/controllers/admin.controller";
import { isAdmin, protectRoute } from "@/middlewares/auth.middleware";
import express, { Router } from "express";

const router: Router = express.Router();

// Mentee routes
router.get("/mentees", protectRoute, isAdmin, listMentees);
router.get("/mentees/:id", protectRoute, isAdmin, getMentee);
router.put("/mentees/:id", protectRoute, isAdmin, updateMentee);
router.delete("/mentees/:id", protectRoute, isAdmin, deleteMentee);

// Mentor routes
router.get("/mentors", protectRoute, isAdmin, listMentors);
router.get("/mentors/pending", protectRoute, isAdmin, getPendingMentors);
router.get("/mentors/:id", protectRoute, isAdmin, getMentor);
router.put("/mentors/:id", protectRoute, isAdmin, updateMentor);
router.delete("/mentors/:id", protectRoute, isAdmin, deleteMentor);

// Review mentor route
router.post("/mentors/:id/review", protectRoute, isAdmin, reviewMentor);

// Invoice route
router.get("/invoices", protectRoute, isAdmin, getInvoiceStats);

export default router;
