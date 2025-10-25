import { isEmailExist } from "@/services/auth.service";
import z from "zod";

const emailSchema = z.email("Email is invalid").refine(
  async (email) => {
    const existingUser = await isEmailExist(email);
    return !existingUser;
  },
  {
    message: "Email already in use",
    path: ["email"],
  }
);

const passwordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters long" })
  .max(20, { error: "Password must be at most 20 characters long" });

export const RegisterSchema = z.object({
  firstName: z.string().min(1, { error: "First name is required" }),
  lastName: z.string().min(1, { error: "Last name is required" }),
  email: emailSchema,
  password: passwordSchema,
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: passwordSchema,
});

export type TResetPasswordSchema = z.TypeOf<typeof ResetPasswordSchema>;
export type TRegisterSchema = z.infer<typeof RegisterSchema>;
