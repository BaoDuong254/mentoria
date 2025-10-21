import { Provider, Role, Sex, Status } from "@/constants/type";
import z from "zod";

export const AccountSchema = z.object({
  user_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  sex: z.enum([Sex.Male, Sex.Female]).nullable(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  email: z.email(),
  password: z.string().nullable(), // Make nullable for Google users
  avatar_url: z.string().nullable(),
  country: z.string().nullable(),
  role: z.enum([Role.Mentee, Role.Mentor, Role.Admin]).default(Role.Mentee),
  timezone: z.string().nullable(),
  status: z.enum([Status.Active, Status.Banned, Status.Pending]).default(Status.Pending),
  is_email_verified: z.boolean().default(false),
  otp: z.string().nullable(),
  otp_expiration: z.string().nullable(),
  reset_password_token: z.string().nullable(),
  reset_password_token_expiration: z.string().nullable(),
  google_id: z.string().nullable(),
  provider: z.enum([Provider.Local, Provider.Google]).default(Provider.Local),
});

export type TAccountSchema = z.TypeOf<typeof AccountSchema>;
