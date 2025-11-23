import { getSuperCategoriesService } from "@/services/catalog.service";
import { SuperCategoriesQuery } from "@/types/catalog.type";
import { SuperCategoriesSchema } from "@/validation/catalog.schema";
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
