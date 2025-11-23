import { getSuperCategories } from "@/controllers/catalog.controller";
import express, { Router } from "express";

const router: Router = express.Router();

router.get("/supercategories", getSuperCategories);

export default router;
