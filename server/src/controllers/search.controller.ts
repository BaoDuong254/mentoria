import { searchMentorsService, searchSkillsService, searchCompaniesService } from "@/services/search.service";
import { SearchMentorsQuery, SearchSkillsQuery, SearchCompaniesQuery } from "@/types/search.type";
import { SearchMentorsSchema, SearchSkillsSchema, SearchCompaniesSchema } from "@/validation/search.schema";
import { Request, Response } from "express";
import { ZodError } from "zod";

export const searchMentors = async (req: Request, res: Response) => {
  try {
    const validatedQuery = SearchMentorsSchema.parse(req.query);

    // Build query object
    const searchQuery: SearchMentorsQuery = {
      keyword: validatedQuery.keyword,
      ...(validatedQuery.page !== undefined && { page: validatedQuery.page }),
      ...(validatedQuery.limit !== undefined && { limit: validatedQuery.limit }),
    };

    const result = await searchMentorsService(searchQuery);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const zodError = error as ZodError;
      return res.status(400).json({
        success: false,
        message: zodError.issues[0]?.message || "Invalid query parameters",
        errors: zodError.issues,
      });
    }

    console.error("Error in searchMentors controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const searchSkills = async (req: Request, res: Response) => {
  try {
    const validatedQuery = SearchSkillsSchema.parse(req.query);

    // Build query object
    const searchQuery: SearchSkillsQuery = {
      keyword: validatedQuery.keyword,
      ...(validatedQuery.page !== undefined && { page: validatedQuery.page }),
      ...(validatedQuery.limit !== undefined && { limit: validatedQuery.limit }),
    };

    const result = await searchSkillsService(searchQuery);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const zodError = error as ZodError;
      return res.status(400).json({
        success: false,
        message: zodError.issues[0]?.message || "Invalid query parameters",
        errors: zodError.issues,
      });
    }

    console.error("Error in searchSkills controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const searchCompanies = async (req: Request, res: Response) => {
  try {
    const validatedQuery = SearchCompaniesSchema.parse(req.query);

    // Build query object
    const searchQuery: SearchCompaniesQuery = {
      keyword: validatedQuery.keyword,
      ...(validatedQuery.page !== undefined && { page: validatedQuery.page }),
      ...(validatedQuery.limit !== undefined && { limit: validatedQuery.limit }),
    };

    const result = await searchCompaniesService(searchQuery);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const zodError = error as ZodError;
      return res.status(400).json({
        success: false,
        message: zodError.issues[0]?.message || "Invalid query parameters",
        errors: zodError.issues,
      });
    }

    console.error("Error in searchCompanies controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
