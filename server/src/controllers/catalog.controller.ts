import {
  getSuperCategoriesService,
  getSkillsService,
  getCompaniesService,
  getJobTitlesService,
  getCountriesService,
} from "@/services/catalog.service";
import {
  SuperCategoriesQuery,
  SkillsQuery,
  CompaniesQuery,
  JobTitlesQuery,
  CountriesQuery,
} from "@/types/catalog.type";
import {
  SuperCategoriesSchema,
  SkillsSchema,
  CompaniesSchema,
  JobTitlesSchema,
  CountriesSchema,
} from "@/validation/catalog.schema";
import { Request, Response } from "express";
import { ZodError } from "zod";

export const getSuperCategories = async (req: Request, res: Response) => {
  try {
    const validatedQuery = SuperCategoriesSchema.parse(req.query);

    // Build query object
    const query: SuperCategoriesQuery = {
      ...(validatedQuery.page !== undefined && { page: validatedQuery.page }),
      ...(validatedQuery.limit !== undefined && { limit: validatedQuery.limit }),
    };

    const result = await getSuperCategoriesService(query);

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

    console.error("Error in getSuperCategories controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getSkills = async (req: Request, res: Response) => {
  try {
    const validatedQuery = SkillsSchema.parse(req.query);

    // Build query object
    const query: SkillsQuery = {
      ...(validatedQuery.page !== undefined && { page: validatedQuery.page }),
      ...(validatedQuery.limit !== undefined && { limit: validatedQuery.limit }),
    };

    const result = await getSkillsService(query);

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

    console.error("Error in getSkills controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCompanies = async (req: Request, res: Response) => {
  try {
    const validatedQuery = CompaniesSchema.parse(req.query);

    // Build query object
    const query: CompaniesQuery = {
      ...(validatedQuery.page !== undefined && { page: validatedQuery.page }),
      ...(validatedQuery.limit !== undefined && { limit: validatedQuery.limit }),
    };

    const result = await getCompaniesService(query);

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

    console.error("Error in getCompanies controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getJobTitles = async (req: Request, res: Response) => {
  try {
    const validatedQuery = JobTitlesSchema.parse(req.query);

    // Build query object
    const query: JobTitlesQuery = {
      ...(validatedQuery.page !== undefined && { page: validatedQuery.page }),
      ...(validatedQuery.limit !== undefined && { limit: validatedQuery.limit }),
    };

    const result = await getJobTitlesService(query);

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

    console.error("Error in getJobTitles controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCountries = async (req: Request, res: Response) => {
  try {
    const validatedQuery = CountriesSchema.parse(req.query);

    // Build query object
    const query: CountriesQuery = {
      ...(validatedQuery.page !== undefined && { page: validatedQuery.page }),
      ...(validatedQuery.limit !== undefined && { limit: validatedQuery.limit }),
    };

    const result = await getCountriesService(query);

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

    console.error("Error in getCountries controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
