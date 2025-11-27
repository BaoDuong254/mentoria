import { z } from "zod";

export const CreateCheckoutSessionSchema = z.object({
  menteeId: z.coerce.number().int().positive("Mentee ID must be a positive integer"),
  mentorId: z.coerce.number().int().positive("Mentor ID must be a positive integer"),
  planId: z.coerce.number().int().positive("Plan ID must be a positive integer"),
  slotStartTime: z.string().refine((dateStr) => {
    const parsedDate = new Date(dateStr);
    return !isNaN(parsedDate.getTime());
  }, "Slot start time must be a valid ISO 8601 datetime string"),
  slotEndTime: z.string().refine((dateStr) => {
    const parsedDate = new Date(dateStr);
    return !isNaN(parsedDate.getTime());
  }, "Slot end time must be a valid ISO 8601 datetime string"),
  message: z.string().min(1, "Message is required").max(1000, "Message cannot exceed 1000 characters"),
  discountCode: z.string().optional(),
});

export type TCreateCheckoutSessionSchema = z.infer<typeof CreateCheckoutSessionSchema>;
