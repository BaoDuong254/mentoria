import { filterMentors, getAvailableFilters } from "@/controllers/filter.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/mentors", filterMentors);
router.get("/available", getAvailableFilters);

export default router;
