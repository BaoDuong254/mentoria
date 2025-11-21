import { searchMentors, searchSkills } from "@/controllers/search.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/mentors", searchMentors);
router.get("/skills", searchSkills);

export default router;
