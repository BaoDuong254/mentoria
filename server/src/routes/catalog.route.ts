import { getSuperCategories, getSkills, getCompanies } from "@/controllers/catalog.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/supercategories", getSuperCategories);
router.get("/skills", getSkills);
router.get("/companies", getCompanies);

export default router;
