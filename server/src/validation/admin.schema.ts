import z from "zod";

export const UpdateMenteeSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  goal: z.string().max(500).optional(),
  status: z.enum(["Active", "Inactive", "Banned", "Pending"]).optional(),
});

export const UpdateMentorSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  bio: z.string().max(1000).optional(),
  headline: z.string().max(200).optional(),
  response_time: z.string().min(1).max(100).optional(),
  cv_url: z.string().url().optional(),
  status: z.enum(["Active", "Inactive", "Banned", "Pending"]).optional(),
});

export const ReviewMentorSchema = z.object({
  action: z.enum(["accept", "reject"]),
});

export type UpdateMenteeInput = z.infer<typeof UpdateMenteeSchema>;
export type UpdateMentorInput = z.infer<typeof UpdateMentorSchema>;
export type ReviewMentorInput = z.infer<typeof ReviewMentorSchema>;
