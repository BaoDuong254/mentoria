import { Request, Response } from "express";
import { FilterMentorsQuery } from "@/types/mentor.type";
import { filterMentorsService } from "@/services/filter.service";

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

    const query: FilterMentorsQuery = {
      ...(page && { page }),
      ...(limit && { limit }),
      skillIds: normalizeNumberArray(req.query.skillIds) ?? [],
      companyIds: normalizeNumberArray(req.query.companyIds) ?? [],
      jobTitleIds: normalizeNumberArray(req.query.jobTitleIds) ?? [],
      countries: normalizeStringArray(req.query.countries) ?? [],
      languages: normalizeStringArray(req.query.languages) ?? [],
      ...(req.query.minPrice !== undefined ? { minPrice: Number(req.query.minPrice) } : {}),
      ...(req.query.maxPrice !== undefined ? { maxPrice: Number(req.query.maxPrice) } : {}),
      ...(req.query.minRating !== undefined ? { minRating: Number(req.query.minRating) } : {}),
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
