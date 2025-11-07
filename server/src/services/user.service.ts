import poolPromise from "@/config/database";
import { Provider } from "@/constants/type";
import bcrypt from "bcrypt";

const saltRounds = 10;

const hashPassword = async (plainText: string) => {
  const hashedPassword = await bcrypt.hash(plainText, saltRounds);
  return hashedPassword;
};

const comparePassword = async (plainText: string, hash: string) => {
  const isMatch = await bcrypt.compare(plainText, hash);
  return isMatch;
};

const updateAvatarService = async (userId: number, avatarUrl: string) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Update user avatar
    await pool
      .request()
      .input("userId", userId)
      .input("avatarUrl", avatarUrl)
      .input("updatedAt", new Date())
      .query("UPDATE users SET avatar_url = @avatarUrl, updated_at = @updatedAt WHERE user_id = @userId");

    return {
      success: true,
      message: "Avatar updated successfully",
    };
  } catch (error) {
    console.error("Error in updateAvatarService:", error);
    throw error;
  }
};

const changePasswordService = async (userId: number, oldPassword: string, newPassword: string) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    // Get user's current password
    const userResult = await pool
      .request()
      .input("userId", userId)
      .query("SELECT password, provider FROM users WHERE user_id = @userId");

    if (userResult.recordset.length === 0) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const user = userResult.recordset[0];

    // Check if user is using Google authentication
    if (user.provider === Provider.Google || !user.password) {
      return {
        success: false,
        message: "Cannot change password for Google authenticated users",
      };
    }

    // Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Current password is incorrect",
      };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await pool
      .request()
      .input("userId", userId)
      .input("newPassword", hashedPassword)
      .input("updatedAt", new Date())
      .query("UPDATE users SET password = @newPassword, updated_at = @updatedAt WHERE user_id = @userId");

    return {
      success: true,
      message: "Password changed successfully",
    };
  } catch (error) {
    console.error("Error in changePasswordService:", error);
    throw error;
  }
};

export { updateAvatarService, changePasswordService };
