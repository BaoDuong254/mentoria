import { searchMentors } from "@/controllers/search.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/mentors", searchMentors);

export default router;
