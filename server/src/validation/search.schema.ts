import z from "zod";

// Base search schema that all search endpoints use
const BaseSearchSchema = z.object({
  keyword: z
    .string()
    .min(1, "Keyword cannot be empty")
    .trim()
    .transform((val) => val.replace(/\s+/g, " ")), // Normalize multiple spaces to single space
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
      message: "Page must be a positive integer",
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (!isNaN(val) && val >= 1 && val <= 100), {
      message: "Limit must be between 1 and 100",
    }),
});

// Export the same schema for all search endpoints
export const SearchMentorsSchema = BaseSearchSchema;
export const SearchSkillsSchema = BaseSearchSchema;
export const SearchCompaniesSchema = BaseSearchSchema;
export const SearchJobTitlesSchema = BaseSearchSchema;

// Type exports
export type TSearchMentorsSchema = z.TypeOf<typeof SearchMentorsSchema>;
export type TSearchSkillsSchema = z.TypeOf<typeof SearchSkillsSchema>;
export type TSearchCompaniesSchema = z.TypeOf<typeof SearchCompaniesSchema>;
export type TSearchJobTitlesSchema = z.TypeOf<typeof SearchJobTitlesSchema>;
