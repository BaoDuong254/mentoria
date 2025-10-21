import poolPromise from "@/config/database";
import { TAccountSchema } from "@/validation/account.schema";
import bcrypt from "bcrypt";

const saltRounds = 10;

const hashPassword = async (plainText: string) => {
  const hashedPassword = await bcrypt.hash(plainText, saltRounds);
  return hashedPassword;
};

// const comparePassword = async (plainText: string, hash: string) => {
//   const isMatch = await bcrypt.compare(plainText, hash);
//   return isMatch;
// };

const isEmailExist = async (email: string): Promise<boolean> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const user = await pool.request().input("email", email).query("SELECT 1 FROM users WHERE email = @email");
  return user.recordset.length > 0;
};

const registerUserService = async (
  firstName: string,
  lastName: string,
  email: string,
  password: string
): Promise<TAccountSchema> => {
  const passwordHash = await hashPassword(password);
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otp_expiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

  // Insert user and get the inserted user data
  const result = await pool
    .request()
    .input("firstName", firstName)
    .input("lastName", lastName)
    .input("email", email)
    .input("password", passwordHash)
    .input("otp", otp)
    .input("otp_expiration", otp_expiration)
    .query(
      `INSERT INTO users (first_name, last_name, email, password, otp, otp_expiration)
       OUTPUT INSERTED.user_id, INSERTED.first_name, INSERTED.last_name, INSERTED.email,
              INSERTED.created_at, INSERTED.updated_at, INSERTED.sex, INSERTED.avatar_url,
              INSERTED.country, INSERTED.role, INSERTED.timezone, INSERTED.status, INSERTED.is_email_verified,
              INSERTED.otp, INSERTED.otp_expiration
       VALUES (@firstName, @lastName, @email, @password, @otp, @otp_expiration)`
    );

  return result.recordset[0];
};

const verifyOTPService = async (
  otp: string
): Promise<{
  success: boolean;
  message: string;
  needResend?: boolean;
  email?: string;
  newOtp?: string;
  user?: { user_id: number; role: string; status: string };
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // First check if OTP exists
  const otpResult = await pool
    .request()
    .input("otp", otp)
    .query("SELECT user_id, email, otp_expiration, role, status FROM users WHERE otp = @otp");

  if (otpResult.recordset.length === 0) {
    return { success: false, message: "OTP is invalid" };
  }

  const user = otpResult.recordset[0];
  const currentTime = new Date();
  const otpExpiration = new Date(user.otp_expiration);

  // Check if OTP is expired
  if (currentTime > otpExpiration) {
    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newOtpExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Update user with new OTP
    await pool
      .request()
      .input("userId", user.user_id)
      .input("newOtp", newOtp)
      .input("newOtpExpiration", newOtpExpiration)
      .query("UPDATE users SET otp = @newOtp, otp_expiration = @newOtpExpiration WHERE user_id = @userId");

    return {
      success: false,
      message: "Your OTP has expired. We have sent a new OTP to your email address.",
      needResend: true,
      email: user.email,
      newOtp: newOtp,
    };
  }

  // OTP is valid, update user verification status
  await pool
    .request()
    .input("userId", user.user_id)
    .query("UPDATE users SET is_email_verified = 1, otp = NULL, otp_expiration = NULL WHERE user_id = @userId");

  return {
    success: true,
    message: "Email verified successfully",
    user: {
      user_id: user.user_id,
      role: user.role,
      status: user.status,
    },
  };
};

export { isEmailExist, registerUserService, verifyOTPService };
