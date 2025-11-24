import { getSuperCategories, getSkills } from "@/controllers/catalog.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/supercategories", getSuperCategories);
router.get("/skills", getSkills);

export default router;
