import { TAccountSchema } from "@/validation/account.schema";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends Omit<
      TAccountSchema,
      | "password"
      | "otp"
      | "otp_expiration"
      | "is_email_verified"
      | "reset_password_token"
      | "reset_password_token_expiration"
    > {}
  }
}

export {};
