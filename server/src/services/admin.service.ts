import poolPromise from "@/config/database";
import { Status } from "@/constants/type";
import {
  AdminMenteeItem,
  AdminMentorItem,
  AdminServiceResponse,
  AdminListResponse,
  UpdateAdminMenteeRequest,
  UpdateAdminMentorRequest,
  ReviewAction,
} from "@/types/admin.type";

const listMenteesService = async (
  page: number = 1,
  limit: number = 10
): Promise<AdminListResponse<AdminMenteeItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await pool.request().query(`
    SELECT COUNT(*) as total
    FROM users u
    JOIN mentees m ON u.user_id = m.user_id
  `);
  const totalItems = countResult.recordset[0].total;
  const totalPages = Math.ceil(totalItems / limit);

  // Get paginated results
  const result = await pool.request().input("limit", limit).input("offset", offset).query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, m.goal
    FROM users u
    JOIN mentees m ON u.user_id = m.user_id
    ORDER BY u.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `);

  return {
    success: true,
    message: "Mentees retrieved successfully",
    data: result.recordset,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getMenteeService = async (userId: number): Promise<AdminServiceResponse<AdminMenteeItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const result = await pool.request().input("userId", userId).query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, m.goal
    FROM users u
    JOIN mentees m ON u.user_id = m.user_id
    WHERE u.user_id = @userId
  `);

  if (result.recordset.length === 0) {
    return {
      success: false,
      message: "Mentee not found",
    };
  }

  return {
    success: true,
    message: "Mentee retrieved successfully",
    data: result.recordset[0],
  };
};

const updateMenteeService = async (userId: number, data: UpdateAdminMenteeRequest): Promise<AdminServiceResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Check if mentee exists
  const existingMentee = await getMenteeService(userId);
  if (!existingMentee.success) {
    return {
      success: false,
      message: "Mentee not found",
    };
  }

  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // Build dynamic update for users table
    const userFields: string[] = [];
    const userRequest = transaction.request().input("userId", userId);

    if ("first_name" in data) {
      userFields.push("first_name = @firstName");
      userRequest.input("firstName", data.first_name);
    }
    if ("last_name" in data) {
      userFields.push("last_name = @lastName");
      userRequest.input("lastName", data.last_name);
    }
    if ("email" in data) {
      // Check if email is already in use by another user
      const emailCheckResult = await transaction
        .request()
        .input("email", data.email)
        .input("userId", userId)
        .query(`SELECT user_id FROM users WHERE email = @email AND user_id <> @userId`);

      if (emailCheckResult.recordset.length > 0) {
        await transaction.rollback();
        return {
          success: false,
          message: "Email already in use",
        };
      }

      userFields.push("email = @email");
      userRequest.input("email", data.email);
    }

    if (userFields.length > 0) {
      userFields.push("updated_at = GETDATE()");
      await userRequest.query(`
        UPDATE users
        SET ${userFields.join(", ")}
        WHERE user_id = @userId
      `);
    }

    // Update goal in mentees table
    if ("goal" in data) {
      await transaction
        .request()
        .input("userId", userId)
        .input("goal", data.goal)
        .query(`UPDATE mentees SET goal = @goal WHERE user_id = @userId`);
    }

    await transaction.commit();

    return {
      success: true,
      message: "Mentee updated successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteMenteeService = async (userId: number): Promise<AdminServiceResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Check if mentee exists
  const existingMentee = await getMenteeService(userId);
  if (!existingMentee.success) {
    return {
      success: false,
      message: "Mentee not found",
    };
  }

  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // Delete related records with NO ACTION FK constraints
    await transaction.request().input("userId", userId).query(`
      DELETE FROM messages WHERE sender_id = @userId OR receiver_id = @userId
    `);

    await transaction.request().input("userId", userId).query(`
      DELETE FROM feedbacks WHERE mentee_id = @userId
    `);

    // Delete user (cascades to mentees table)
    const result = await transaction.request().input("userId", userId).query(`
      DELETE FROM users WHERE user_id = @userId
    `);

    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return {
        success: false,
        message: "Failed to delete mentee",
      };
    }

    await transaction.commit();

    return {
      success: true,
      message: "Mentee deleted successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ==================== MENTOR SERVICES ====================

const listMentorsService = async (
  page: number = 1,
  limit: number = 10
): Promise<AdminListResponse<AdminMentorItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await pool.request().query(`
    SELECT COUNT(*) as total
    FROM users u
    JOIN mentors m ON u.user_id = m.user_id
  `);
  const totalItems = countResult.recordset[0].total;
  const totalPages = Math.ceil(totalItems / limit);

  // Get paginated results
  const result = await pool.request().input("limit", limit).input("offset", offset).query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role,
           m.bio, m.cv_url, m.headline, m.response_time
    FROM users u
    JOIN mentors m ON u.user_id = m.user_id
    ORDER BY u.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `);

  return {
    success: true,
    message: "Mentors retrieved successfully",
    data: result.recordset,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getPendingMentorsService = async (
  page: number = 1,
  limit: number = 10
): Promise<AdminListResponse<AdminMentorItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const offset = (page - 1) * limit;

  // Get total count
  const countResult = await pool.request().input("status", Status.Pending).query(`
    SELECT COUNT(*) as total
    FROM users u
    JOIN mentors m ON u.user_id = m.user_id
    WHERE u.status = @status
  `);
  const totalItems = countResult.recordset[0].total;
  const totalPages = Math.ceil(totalItems / limit);

  // Get paginated results
  const result = await pool.request().input("status", Status.Pending).input("limit", limit).input("offset", offset)
    .query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role, u.created_at,
           m.bio, m.cv_url, m.headline, m.response_time
    FROM users u
    JOIN mentors m ON u.user_id = m.user_id
    WHERE u.status = @status
    ORDER BY u.created_at DESC
    OFFSET @offset ROWS
    FETCH NEXT @limit ROWS ONLY
  `);

  return {
    success: true,
    message: "Pending mentors retrieved successfully",
    data: result.recordset,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
};

const getMentorService = async (userId: number): Promise<AdminServiceResponse<AdminMentorItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const result = await pool.request().input("userId", userId).query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role,
           m.bio, m.cv_url, m.headline, m.response_time
    FROM users u
    JOIN mentors m ON u.user_id = m.user_id
    WHERE u.user_id = @userId
  `);

  if (result.recordset.length === 0) {
    return {
      success: false,
      message: "Mentor not found",
    };
  }

  return {
    success: true,
    message: "Mentor retrieved successfully",
    data: result.recordset[0],
  };
};

const updateMentorService = async (userId: number, data: UpdateAdminMentorRequest): Promise<AdminServiceResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Check if mentor exists
  const existingMentor = await getMentorService(userId);
  if (!existingMentor.success) {
    return {
      success: false,
      message: "Mentor not found",
    };
  }

  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // Build dynamic update for users table
    const userFields: string[] = [];
    const userRequest = transaction.request().input("userId", userId);

    if ("first_name" in data) {
      userFields.push("first_name = @firstName");
      userRequest.input("firstName", data.first_name);
    }
    if ("last_name" in data) {
      userFields.push("last_name = @lastName");
      userRequest.input("lastName", data.last_name);
    }
    if ("email" in data) {
      // Check if email is already in use by another user
      const emailCheckResult = await transaction
        .request()
        .input("email", data.email)
        .input("userId", userId)
        .query(`SELECT user_id FROM users WHERE email = @email AND user_id <> @userId`);

      if (emailCheckResult.recordset.length > 0) {
        await transaction.rollback();
        return {
          success: false,
          message: "Email already in use",
        };
      }

      userFields.push("email = @email");
      userRequest.input("email", data.email);
    }

    if (userFields.length > 0) {
      userFields.push("updated_at = GETDATE()");
      await userRequest.query(`
        UPDATE users
        SET ${userFields.join(", ")}
        WHERE user_id = @userId
      `);
    }

    // Build dynamic update for mentors table
    const mentorFields: { [key: string]: string | number | null | undefined } = {};
    const mentorUpdates: string[] = [];

    if ("bio" in data) {
      mentorFields["bio"] = data.bio;
      mentorUpdates.push("bio = @bio");
    }
    if ("headline" in data) {
      mentorFields["headline"] = data.headline;
      mentorUpdates.push("headline = @headline");
    }
    if ("response_time" in data) {
      mentorFields["responseTime"] = data.response_time;
      mentorUpdates.push("response_time = @responseTime");
    }
    if ("cv_url" in data) {
      mentorFields["cvUrl"] = data.cv_url;
      mentorUpdates.push("cv_url = @cvUrl");
    }

    if (mentorUpdates.length > 0) {
      const mentorRequest = transaction.request().input("userId", userId);
      for (const [key, value] of Object.entries(mentorFields)) {
        mentorRequest.input(key, value);
      }
      await mentorRequest.query(`
        UPDATE mentors
        SET ${mentorUpdates.join(", ")}
        WHERE user_id = @userId
      `);
    }

    await transaction.commit();

    return {
      success: true,
      message: "Mentor updated successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteMentorService = async (userId: number): Promise<AdminServiceResponse> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Check if mentor exists
  const existingMentor = await getMentorService(userId);
  if (!existingMentor.success) {
    return {
      success: false,
      message: "Mentor not found",
    };
  }

  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // Delete related records with NO ACTION FK constraints
    await transaction.request().input("userId", userId).query(`
      DELETE FROM messages WHERE sender_id = @userId OR receiver_id = @userId
    `);

    await transaction.request().input("userId", userId).query(`
      DELETE FROM feedbacks WHERE mentor_id = @userId
    `);

    // Delete meetings that reference this mentor's slots
    await transaction.request().input("userId", userId).query(`
      DELETE FROM meetings WHERE mentor_id = @userId
    `);

    // Delete user (cascades to mentors, slots, plans, etc.)
    const result = await transaction.request().input("userId", userId).query(`
      DELETE FROM users WHERE user_id = @userId
    `);

    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return {
        success: false,
        message: "Failed to delete mentor",
      };
    }

    await transaction.commit();

    return {
      success: true,
      message: "Mentor deleted successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

// ==================== REVIEW MENTOR SERVICE ====================

const reviewMentorService = async (
  userId: number,
  action: ReviewAction
): Promise<AdminServiceResponse<AdminMentorItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Get mentor info before any action
  const mentorResult = await getMentorService(userId);
  if (!mentorResult.success || !mentorResult.data) {
    return {
      success: false,
      message: "Mentor not found",
    };
  }

  const mentor = mentorResult.data;

  // Only allow review actions for mentors with Pending status
  if (mentor.status !== Status.Pending) {
    return {
      success: false,
      message: "Only pending mentors can be reviewed",
    };
  }

  if (action === "accept") {
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      await transaction
        .request()
        .input("userId", userId)
        .input("status", Status.Inactive)
        .query(`UPDATE users SET status = @status, updated_at = GETDATE() WHERE user_id = @userId`);

      await transaction.commit();

      return {
        success: true,
        message: "Mentor accepted successfully",
        data: mentor,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  if (action === "reject") {
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Delete related records with NO ACTION FK constraints
      await transaction.request().input("userId", userId).query(`
        DELETE FROM messages WHERE sender_id = @userId OR receiver_id = @userId
      `);

      await transaction.request().input("userId", userId).query(`
        DELETE FROM feedbacks WHERE mentor_id = @userId
      `);

      await transaction.request().input("userId", userId).query(`
        DELETE FROM meetings WHERE mentor_id = @userId
      `);

      await transaction.request().input("userId", userId).query(`
        DELETE FROM users WHERE user_id = @userId
      `);

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

    return {
      success: true,
      message: "Mentor rejected and removed successfully",
      data: mentor,
    };
  }

  return {
    success: false,
    message: "Invalid action",
  };
};

// ==================== INVOICE SERVICES ====================

const getInvoiceStatsService = async (
  year?: number,
  month?: number,
  userId?: number,
  userType?: "mentee" | "mentor",
  page: number = 1,
  limit: number = 10
) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month || new Date().getMonth() + 1;
    const offset = (page - 1) * limit;

    let query = `
      SELECT
        i.invoice_id,
        i.amount,
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
        mentee.user_id as mentee_id,
        mentee.first_name as mentee_first_name,
        mentee.last_name as mentee_last_name,
        mentee.email as mentee_email,
        mentee.avatar_url as mentee_avatar_url,
        mentor.user_id as mentor_id,
        mentor.first_name as mentor_first_name,
        mentor.last_name as mentor_last_name,
        mentor.email as mentor_email,
        mentor.avatar_url as mentor_avatar_url
      FROM invoices i
      INNER JOIN plan_registerations pr ON i.plan_registerations_id = pr.registration_id
      INNER JOIN bookings b ON b.plan_registerations_id = pr.registration_id
      INNER JOIN plans p ON b.plan_id = p.plan_id
      INNER JOIN users mentee ON i.mentee_id = mentee.user_id
      INNER JOIN mentors m ON p.mentor_id = m.user_id
      INNER JOIN users mentor ON m.user_id = mentor.user_id
      WHERE YEAR(i.paid_time) = @year
        AND MONTH(i.paid_time) = @month
    `;

    let totalQuery = `
      SELECT
        ISNULL(SUM(i.amount), 0) as total_amount,
        COUNT(*) as total_count
      FROM invoices i
    `;

    const request = pool.request().input("year", currentYear).input("month", currentMonth);

    const totalRequest = pool.request().input("year", currentYear).input("month", currentMonth);

    // Add user-specific filtering if provided
    if (userId && userType === "mentee") {
      query += " AND i.mentee_id = @userId";
      totalQuery += `
      WHERE YEAR(i.paid_time) = @year
        AND MONTH(i.paid_time) = @month
        AND i.mentee_id = @userId
      `;
      request.input("userId", userId);
      totalRequest.input("userId", userId);
    } else if (userId && userType === "mentor") {
      query += " AND p.mentor_id = @userId";
      totalQuery += `
      INNER JOIN plan_registerations pr ON i.plan_registerations_id = pr.registration_id
      INNER JOIN bookings b ON b.plan_registerations_id = pr.registration_id
      INNER JOIN plans p ON b.plan_id = p.plan_id
      WHERE YEAR(i.paid_time) = @year
        AND MONTH(i.paid_time) = @month
        AND p.mentor_id = @userId
      `;
      request.input("userId", userId);
      totalRequest.input("userId", userId);
    } else {
      totalQuery += `
      WHERE YEAR(i.paid_time) = @year
        AND MONTH(i.paid_time) = @month
      `;
    }

    query += " ORDER BY i.paid_time DESC OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";
    request.input("offset", offset).input("limit", limit);

    const [invoicesResult, totalResult] = await Promise.all([request.query(query), totalRequest.query(totalQuery)]);

    const totalItems = totalResult.recordset[0].total_count;
    const totalPages = Math.ceil(totalItems / limit);

    return {
      success: true,
      data: {
        year: currentYear,
        month: currentMonth,
        total_amount: totalResult.recordset[0].total_amount,
        total_count: totalItems,
        invoices: invoicesResult.recordset,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    };
  } catch (error) {
    console.error("Error in getInvoiceStatsService:", error);
    throw error;
  }
};

export {
  listMenteesService,
  getMenteeService,
  updateMenteeService,
  deleteMenteeService,
  listMentorsService,
  getPendingMentorsService,
  getMentorService,
  updateMentorService,
  deleteMentorService,
  reviewMentorService,
  getInvoiceStatsService,
};
