import z from "zod";

const passwordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters long" })
  .max(20, { error: "Password must be at most 20 characters long" });

export const ChangePasswordSchema = z
  .object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirm password do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
  });

export type TChangePasswordSchema = z.TypeOf<typeof ChangePasswordSchema>;
