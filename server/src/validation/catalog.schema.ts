import z from "zod";

// Reusable pagination schema
const createPaginationSchema = () =>
  z.object({
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

export const SuperCategoriesSchema = createPaginationSchema();
export type TSuperCategoriesSchema = z.TypeOf<typeof SuperCategoriesSchema>;

export const SkillsSchema = createPaginationSchema();
export type TSkillsSchema = z.TypeOf<typeof SkillsSchema>;

export const CompaniesSchema = createPaginationSchema();
export type TCompaniesSchema = z.TypeOf<typeof CompaniesSchema>;

export const JobTitlesSchema = createPaginationSchema();
export type TJobTitlesSchema = z.TypeOf<typeof JobTitlesSchema>;

export const CountriesSchema = createPaginationSchema();
export type TCountriesSchema = z.TypeOf<typeof CountriesSchema>;

export const LanguagesSchema = createPaginationSchema();
export type TLanguagesSchema = z.TypeOf<typeof LanguagesSchema>;
