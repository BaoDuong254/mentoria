import { Role, Sex, Status } from "@/constants/type";
import z from "zod";

export const AccountSchema = z.object({
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  sex: z.enum([Sex.Male, Sex.Female]).nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  email: z.email(),
  password: z.string(),
  avatar_url: z.string().nullable(),
  country: z.string().nullable(),
  role: z.enum([Role.Mentee, Role.Mentor, Role.Admin]).default(Role.Mentee),
  timezone: z.string().nullable(),
  status: z.enum([Status.Active, Status.Banned, Status.Pending]).default(Status.Pending),
  is_email_verified: z.boolean().default(false),
  otp: z.string().nullable(),
  otp_expiration: z.string().nullable(),
});

export type TAccountSchema = z.TypeOf<typeof AccountSchema>;
