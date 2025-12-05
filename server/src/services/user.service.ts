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

const getMenteeInvoiceStatsService = async (menteeId: number, year?: number, month?: number) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Get all invoices for the mentee with mentor details
    const invoicesResult = await pool
      .request()
      .input("menteeId", menteeId)
      .input("year", currentYear)
      .input("month", currentMonth).query(`
        SELECT
          i.invoice_id,
          i.method,
          i.paid_time,
          i.payment_status,
          i.currency,
          i.amount_subtotal,
          i.amount_total,
          i.stripe_receipt_url,
          p.plan_description,
          p.plan_type,
          p.plan_charge,
          u.user_id as mentor_id,
          u.first_name as mentor_first_name,
          u.last_name as mentor_last_name,
          u.avatar_url as mentor_avatar_url
        FROM invoices i
        INNER JOIN plan_registerations pr ON i.plan_registerations_id = pr.registration_id
        INNER JOIN bookings b ON b.plan_registerations_id = pr.registration_id
        INNER JOIN plans p ON b.plan_id = p.plan_id
        INNER JOIN mentors m ON p.mentor_id = m.user_id
        INNER JOIN users u ON m.user_id = u.user_id
        WHERE i.mentee_id = @menteeId
          AND YEAR(i.paid_time) = @year
          AND MONTH(i.paid_time) = @month
        ORDER BY i.paid_time DESC
      `);

    // Calculate total amount for the month
    const totalResult = await pool
      .request()
      .input("menteeId", menteeId)
      .input("year", currentYear)
      .input("month", currentMonth).query(`
        SELECT
          ISNULL(SUM(amount_total), 0) as total_spent
        FROM invoices
        WHERE mentee_id = @menteeId
          AND YEAR(paid_time) = @year
          AND MONTH(paid_time) = @month
      `);

    return {
      success: true,
      data: {
        year: currentYear,
        month: currentMonth,
        total_spent: totalResult.recordset[0].total_spent,
        invoices: invoicesResult.recordset,
        count: invoicesResult.recordset.length,
      },
    };
  } catch (error) {
    console.error("Error in getMenteeInvoiceStatsService:", error);
    throw error;
  }
};

const getMentorInvoiceStatsService = async (mentorId: number, year?: number, month?: number) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;

    // Get all invoices received by the mentor with mentee details
    const invoicesResult = await pool
      .request()
      .input("mentorId", mentorId)
      .input("year", currentYear)
      .input("month", currentMonth).query(`
        SELECT
          i.invoice_id,
          i.method,
          i.paid_time,
          i.payment_status,
          i.currency,
          i.amount_subtotal,
          i.amount_total,
          i.stripe_receipt_url,
          p.plan_description,
          p.plan_type,
          p.plan_charge,
          u.user_id as mentee_id,
          u.first_name as mentee_first_name,
          u.last_name as mentee_last_name,
          u.avatar_url as mentee_avatar_url,
          u.email as mentee_email
        FROM invoices i
        INNER JOIN plan_registerations pr ON i.plan_registerations_id = pr.registration_id
        INNER JOIN bookings b ON b.plan_registerations_id = pr.registration_id
        INNER JOIN plans p ON b.plan_id = p.plan_id
        INNER JOIN users u ON i.mentee_id = u.user_id
        WHERE p.mentor_id = @mentorId
          AND YEAR(i.paid_time) = @year
          AND MONTH(i.paid_time) = @month
        ORDER BY i.paid_time DESC
      `);

    // Calculate total amount received for the month
    const totalResult = await pool
      .request()
      .input("mentorId", mentorId)
      .input("year", currentYear)
      .input("month", currentMonth).query(`
        SELECT
          ISNULL(SUM(i.amount_total), 0) as total_received
        FROM invoices i
        INNER JOIN plan_registerations pr ON i.plan_registerations_id = pr.registration_id
        INNER JOIN bookings b ON b.plan_registerations_id = pr.registration_id
        INNER JOIN plans p ON b.plan_id = p.plan_id
        WHERE p.mentor_id = @mentorId
          AND YEAR(i.paid_time) = @year
          AND MONTH(i.paid_time) = @month
      `);

    return {
      success: true,
      data: {
        year: currentYear,
        month: currentMonth,
        total_received: totalResult.recordset[0].total_received,
        invoices: invoicesResult.recordset,
        count: invoicesResult.recordset.length,
      },
    };
  } catch (error) {
    console.error("Error in getMentorInvoiceStatsService:", error);
    throw error;
  }
};

export { updateAvatarService, changePasswordService, getMenteeInvoiceStatsService, getMentorInvoiceStatsService };
