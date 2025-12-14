import { Request, Response } from "express";
import { FilterMentorsQuery } from "@/types/mentor.type";
import { filterMentorsService, getAvailableFiltersService } from "@/services/filter.service";

const normalizeStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) return value as string[];
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return undefined;
};

const normalizeNumberArray = (value: unknown): number[] | undefined => {
  const arr = normalizeStringArray(value);
  if (!arr) return undefined;
  const nums = arr.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
  return nums.length > 0 ? nums : undefined;
};

export const filterMentors = async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    // Helper to parse number from query, handling empty strings
    const parseNumber = (value: unknown): number | undefined => {
      if (value === undefined || value === null || value === "") return undefined;
      const num = Number(value);
      return !Number.isNaN(num) ? num : undefined;
    };

    // Pre-parse numeric filters to avoid inserting properties with undefined
    const parsedMinPrice = parseNumber(req.query.minPrice);
    const parsedMaxPrice = parseNumber(req.query.maxPrice);
    const parsedMinRating = parseNumber(req.query.minRating);

    const skillIds = normalizeNumberArray(req.query.skillIds) ?? undefined;
    const companyIds = normalizeNumberArray(req.query.companyIds) ?? undefined;
    const jobTitleIds = normalizeNumberArray(req.query.jobTitleIds) ?? undefined;

    const countries = normalizeStringArray(req.query.countries) ?? undefined;
    const languages = normalizeStringArray(req.query.languages) ?? undefined;

    const query: FilterMentorsQuery = {
      ...(page !== undefined ? { page } : {}),
      ...(limit !== undefined ? { limit } : {}),
      ...(req.query.firstName ? { firstName: String(req.query.firstName) } : {}),
      ...(req.query.lastName ? { lastName: String(req.query.lastName) } : {}),
      ...(req.query.searchName ? { searchName: String(req.query.searchName) } : {}),
      ...(skillIds ? { skillIds } : {}),
      ...(companyIds ? { companyIds } : {}),
      ...(jobTitleIds ? { jobTitleIds } : {}),
      ...(req.query.categoryName ? { categoryName: String(req.query.categoryName) } : {}),
      ...(countries ? { countries } : {}),
      ...(languages ? { languages } : {}),
      ...(req.query.status ? { status: String(req.query.status) } : {}),
      ...(parsedMinPrice !== undefined ? { minPrice: parsedMinPrice } : {}),
      ...(parsedMaxPrice !== undefined ? { maxPrice: parsedMaxPrice } : {}),
      ...(parsedMinRating !== undefined ? { minRating: parsedMinRating } : {}),
      ...(req.query.sortColumn ? { sortColumn: String(req.query.sortColumn) } : {}),
      ...(req.query.sortDirection ? { sortDirection: String(req.query.sortDirection) as "ASC" | "DESC" } : {}),
    };

    const result = await filterMentorsService(query);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in filterMentors controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getAvailableFilters = async (req: Request, res: Response) => {
  try {
    const result = await getAvailableFiltersService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAvailableFilters controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
