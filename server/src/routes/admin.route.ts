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
import { Role } from "@/constants/type";
import express, { Router, Request, Response, NextFunction } from "express";

const router: Router = express.Router();

// Admin authorization middleware
const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req.user as any)?.role !== Role.Admin) {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
  }
  next();
};

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

export default router;
