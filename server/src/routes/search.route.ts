import { searchMentors, searchSkills, searchCompanies, searchJobTitles } from "@/controllers/search.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/mentors", searchMentors);
router.get("/skills", searchSkills);
router.get("/companies", searchCompanies);
router.get("/jobtitles", searchJobTitles);

export default router;
