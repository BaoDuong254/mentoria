import {
  getSuperCategories,
  getSkills,
  getCompanies,
  getJobTitles,
  getCountries,
  getLanguages,
} from "@/controllers/catalog.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/supercategories", getSuperCategories);
router.get("/skills", getSkills);
router.get("/companies", getCompanies);
router.get("/jobtitles", getJobTitles);
router.get("/countries", getCountries);
router.get("/languages", getLanguages);

export default router;
