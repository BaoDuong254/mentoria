import { filterMentors } from "@/controllers/filter.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/mentors", filterMentors);

export default router;
