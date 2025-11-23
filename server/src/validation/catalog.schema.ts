import z from "zod";

export const SuperCategoriesSchema = z.object({
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

export type TSuperCategoriesSchema = z.TypeOf<typeof SuperCategoriesSchema>;
