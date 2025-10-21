import poolPromise from "@/config/database";
import { TAccountSchema } from "@/validation/account.schema";
import bcrypt from "bcrypt";
import crypto from "crypto";

const saltRounds = 10;

const hashPassword = async (plainText: string) => {
  const hashedPassword = await bcrypt.hash(plainText, saltRounds);
  return hashedPassword;
};

const comparePassword = async (plainText: string, hash: string) => {
  const isMatch = await bcrypt.compare(plainText, hash);
  return isMatch;
};

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

const loginUserService = async (
  email: string,
  password: string
): Promise<{
  success: boolean;
  message: string;
  user?: { user_id: number; role: string; status: string; is_email_verified: boolean };
  needVerification?: boolean;
  userEmail?: string;
  newOtp?: string;
}> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Find user by email
  const userResult = await pool
    .request()
    .input("email", email)
    .query("SELECT user_id, email, password, role, status, is_email_verified FROM users WHERE email = @email");

  if (userResult.recordset.length === 0) {
    return { success: false, message: "Invalid email or password" };
  }

  const user = userResult.recordset[0];

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return { success: false, message: "Invalid email or password" };
  }

  // Check if email is verified
  if (!user.is_email_verified) {
    // Generate new OTP for unverified user
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
      message: "Please verify your email before logging in. We have sent a new verification code to your email.",
      needVerification: true,
      userEmail: user.email,
      newOtp: newOtp,
    };
  }

  return {
    success: true,
    message: "Login successful",
    user: {
      user_id: user.user_id,
      role: user.role,
      status: user.status,
      is_email_verified: user.is_email_verified,
    },
  };
};

const forgotPasswordService = async (email: string) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Check if user exists
  const userResult = await pool
    .request()
    .input("email", email)
    .query("SELECT user_id, email FROM users WHERE email = @email");

  if (userResult.recordset.length === 0) {
    return { success: false, message: "Email not found" };
  }

  const user = userResult.recordset[0];

  const resetPasswordToken = crypto.randomUUID();
  const resetPasswordTokenExpired = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  // Update user with reset password token
  await pool
    .request()
    .input("userId", user.user_id)
    .input("resetToken", resetPasswordToken)
    .input("resetTokenExpiry", resetPasswordTokenExpired)
    .query(
      "UPDATE users SET reset_password_token = @resetToken, reset_password_token_expiration = @resetTokenExpiry WHERE user_id = @userId"
    );

  return {
    success: true,
    message: "Password reset link has been sent to your email",
    resetToken: resetPasswordToken,
    email: user.email,
  };
};

const resetPasswordService = async (token: string, newPassword: string) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Find user by reset token and check if token is not expired
  const userResult = await pool.request().input("token", token).query(`
      SELECT user_id, email, reset_password_token_expiration
      FROM users
      WHERE reset_password_token = @token
    `);

  if (userResult.recordset.length === 0) {
    return { success: false, message: "Invalid reset token" };
  }

  const user = userResult.recordset[0];
  const currentTime = new Date();
  const tokenExpiration = new Date(user.reset_password_token_expiration);

  // Check if token is expired
  if (currentTime > tokenExpiration) {
    return { success: false, message: "Reset token has expired" };
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update user password and clear reset token
  await pool.request().input("userId", user.user_id).input("newPassword", hashedPassword).query(`
      UPDATE users
      SET password = @newPassword,
          reset_password_token = NULL,
          reset_password_token_expiration = NULL,
          updated_at = GETDATE()
      WHERE user_id = @userId
    `);

  return {
    success: true,
    message: "Password has been reset successfully",
  };
};

export {
  isEmailExist,
  registerUserService,
  verifyOTPService,
  loginUserService,
  forgotPasswordService,
  resetPasswordService,
};
