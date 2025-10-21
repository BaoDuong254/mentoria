import { TAccountSchema } from "@/validation/account.schema";

declare global {
  namespace Express {
    interface Request {
      user?: Pick<
        TAccountSchema,
        Exclude<keyof TAccountSchema, "password" | "otp" | "otp_expiration" | "is_email_verified">
      >;
    }
  }
}

export {};
