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
  SystemStats,
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
    if ("status" in data) {
      userFields.push("status = @status");
      userRequest.input("status", data.status);
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
    // Delete in proper order to respect FK constraints

    // 1. Delete messages (NO ACTION FK)
    await transaction.request().input("userId", userId).query(`
      DELETE FROM messages WHERE sender_id = @userId OR receiver_id = @userId
    `);

    // 2. Delete feedbacks (NO ACTION FK)
    await transaction.request().input("userId", userId).query(`
      DELETE FROM feedbacks WHERE mentee_id = @userId
    `);

    // 3. Delete meetings related to mentee's bookings
    await transaction.request().input("userId", userId).query(`
      DELETE m
      FROM meetings m
      INNER JOIN invoices i ON m.invoice_id = i.invoice_id
      WHERE i.mentee_id = @userId
    `);

    // 4. Delete invoices (CASCADE from plan_registerations)
    await transaction.request().input("userId", userId).query(`
      DELETE FROM invoices WHERE mentee_id = @userId
    `);

    // 5. Delete bookings (CASCADE from plan_registerations and mentees)
    await transaction.request().input("userId", userId).query(`
      DELETE FROM bookings WHERE mentee_id = @userId
    `);

    // 6. Delete plan_registerations (CASCADE from bookings/invoices deleted)
    await transaction.request().input("userId", userId).query(`
      DELETE pr
      FROM plan_registerations pr
      LEFT JOIN bookings b ON pr.registration_id = b.plan_registerations_id
      LEFT JOIN invoices i ON pr.registration_id = i.plan_registerations_id
      WHERE b.mentee_id = @userId OR i.mentee_id = @userId
    `);

    // 7. Delete user (cascades to mentees table)
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
           m.bio, m.cv_url, m.headline, m.response_time,
           m.bank_name, m.account_number, m.account_holder_name, m.bank_branch, m.swift_code
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
           m.bio, m.cv_url, m.headline, m.response_time,
           m.bank_name, m.account_number, m.account_holder_name, m.bank_branch, m.swift_code
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
    if ("status" in data) {
      userFields.push("status = @status");
      userRequest.input("status", data.status);
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
    if ("bank_name" in data) {
      mentorFields["bankName"] = data.bank_name;
      mentorUpdates.push("bank_name = @bankName");
    }
    if ("account_number" in data) {
      mentorFields["accountNumber"] = data.account_number;
      mentorUpdates.push("account_number = @accountNumber");
    }
    if ("account_holder_name" in data) {
      mentorFields["accountHolderName"] = data.account_holder_name;
      mentorUpdates.push("account_holder_name = @accountHolderName");
    }
    if ("bank_branch" in data) {
      mentorFields["bankBranch"] = data.bank_branch;
      mentorUpdates.push("bank_branch = @bankBranch");
    }
    if ("swift_code" in data) {
      mentorFields["swiftCode"] = data.swift_code;
      mentorUpdates.push("swift_code = @swiftCode");
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
    // Delete in proper order to respect FK constraints

    // 1. Delete messages (NO ACTION FK)
    await transaction.request().input("userId", userId).query(`
      DELETE FROM messages WHERE sender_id = @userId OR receiver_id = @userId
    `);

    // 2. Delete feedbacks (NO ACTION FK)
    await transaction.request().input("userId", userId).query(`
      DELETE FROM feedbacks WHERE mentor_id = @userId
    `);

    // 3. Delete meetings (NO ACTION FK to slots)
    await transaction.request().input("userId", userId).query(`
      DELETE FROM meetings WHERE mentor_id = @userId
    `);

    // 4. Delete invoices related to mentor's plans via bookings
    await transaction.request().input("userId", userId).query(`
      DELETE i
      FROM invoices i
      INNER JOIN bookings b ON i.plan_registerations_id = b.plan_registerations_id
      INNER JOIN plans p ON b.plan_id = p.plan_id
      WHERE p.mentor_id = @userId
    `);

    // 5. Delete bookings (NO ACTION FK to plans)
    await transaction.request().input("userId", userId).query(`
      DELETE b
      FROM bookings b
      INNER JOIN plans p ON b.plan_id = p.plan_id
      WHERE p.mentor_id = @userId
    `);

    // 6. Delete plan_registerations that belonged to deleted bookings/invoices
    await transaction.request().input("userId", userId).query(`
      DELETE pr
      FROM plan_registerations pr
      WHERE NOT EXISTS (
        SELECT 1 FROM bookings b WHERE b.plan_registerations_id = pr.registration_id
      )
      AND NOT EXISTS (
        SELECT 1 FROM invoices i WHERE i.plan_registerations_id = pr.registration_id
      )
    `);

    // 7. Delete slots (NO ACTION FK to plans)
    await transaction.request().input("userId", userId).query(`
      DELETE FROM slots WHERE mentor_id = @userId
    `);

    // 8. Delete plan benefits (CASCADE from plan_mentorships)
    await transaction.request().input("userId", userId).query(`
      DELETE mb
      FROM mentorships_benefits mb
      INNER JOIN plan_mentorships pm ON mb.mentorships_id = pm.mentorships_id
      INNER JOIN plans p ON pm.mentorships_id = p.plan_id
      WHERE p.mentor_id = @userId
    `);

    // 9. Delete plan_mentorships (CASCADE from plans)
    await transaction.request().input("userId", userId).query(`
      DELETE pm
      FROM plan_mentorships pm
      INNER JOIN plans p ON pm.mentorships_id = p.plan_id
      WHERE p.mentor_id = @userId
    `);

    // 10. Delete plan_sessions (CASCADE from plans)
    await transaction.request().input("userId", userId).query(`
      DELETE ps
      FROM plan_sessions ps
      INNER JOIN plans p ON ps.sessions_id = p.plan_id
      WHERE p.mentor_id = @userId
    `);

    // 11. Delete plans
    await transaction.request().input("userId", userId).query(`
      DELETE FROM plans WHERE mentor_id = @userId
    `);

    // 12. Delete user (cascades to mentors, mentor_languages, work_for, set_skill, user_social_links)
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
      // Delete in proper order (pending mentors shouldn't have bookings/invoices, but be safe)

      // 1. Delete messages (NO ACTION FK)
      await transaction.request().input("userId", userId).query(`
        DELETE FROM messages WHERE sender_id = @userId OR receiver_id = @userId
      `);

      // 2. Delete feedbacks (NO ACTION FK)
      await transaction.request().input("userId", userId).query(`
        DELETE FROM feedbacks WHERE mentor_id = @userId
      `);

      // 3. Delete meetings (NO ACTION FK)
      await transaction.request().input("userId", userId).query(`
        DELETE FROM meetings WHERE mentor_id = @userId
      `);

      // 4. Delete slots (NO ACTION FK to plans)
      await transaction.request().input("userId", userId).query(`
        DELETE FROM slots WHERE mentor_id = @userId
      `);

      // 5. Delete plan benefits
      await transaction.request().input("userId", userId).query(`
        DELETE mb
        FROM mentorships_benefits mb
        INNER JOIN plan_mentorships pm ON mb.mentorships_id = pm.mentorships_id
        INNER JOIN plans p ON pm.mentorships_id = p.plan_id
        WHERE p.mentor_id = @userId
      `);

      // 6. Delete plan_mentorships
      await transaction.request().input("userId", userId).query(`
        DELETE pm
        FROM plan_mentorships pm
        INNER JOIN plans p ON pm.mentorships_id = p.plan_id
        WHERE p.mentor_id = @userId
      `);

      // 7. Delete plan_sessions
      await transaction.request().input("userId", userId).query(`
        DELETE ps
        FROM plan_sessions ps
        INNER JOIN plans p ON ps.sessions_id = p.plan_id
        WHERE p.mentor_id = @userId
      `);

      // 8. Delete plans
      await transaction.request().input("userId", userId).query(`
        DELETE FROM plans WHERE mentor_id = @userId
      `);

      // 9. Delete user (cascades to mentors, mentor_languages, work_for, set_skill)
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
        ISNULL(SUM(i.amount_total), 0) as total_amount,
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

const getSystemStatsService = async (): Promise<AdminServiceResponse<SystemStats>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

    // Get user statistics
    const userStatsResult = await pool.request().query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN role = 'Mentor' THEN 1 ELSE 0 END) as mentors,
        SUM(CASE WHEN role = 'Mentee' THEN 1 ELSE 0 END) as mentees,
        SUM(CASE WHEN role = 'Admin' THEN 1 ELSE 0 END) as admins
      FROM users
    `);

    // Get mentor status statistics
    const mentorStatsResult = await pool.request().query(`
      SELECT
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'Banned' THEN 1 ELSE 0 END) as banned
      FROM users
      WHERE role = 'Mentor'
    `);

    // Get mentee status statistics
    const menteeStatsResult = await pool.request().query(`
      SELECT
        SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'Inactive' THEN 1 ELSE 0 END) as inactive,
        SUM(CASE WHEN status = 'Banned' THEN 1 ELSE 0 END) as banned
      FROM users
      WHERE role = 'Mentee'
    `);

    // Get booking statistics (using invoice paid_time as proxy for booking date)
    const bookingStatsResult = await pool
      .request()
      .input("firstDayOfMonth", firstDayOfMonth)
      .input("firstDayOfLastMonth", firstDayOfLastMonth)
      .input("lastDayOfLastMonth", lastDayOfLastMonth).query(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN i.paid_time >= @firstDayOfMonth THEN 1 ELSE 0 END) as thisMonth,
          SUM(CASE WHEN i.paid_time >= @firstDayOfLastMonth AND i.paid_time <= @lastDayOfLastMonth THEN 1 ELSE 0 END) as lastMonth
        FROM bookings b
        JOIN invoices i ON b.plan_registerations_id = i.plan_registerations_id AND b.mentee_id = i.mentee_id
        WHERE i.payment_status = 'paid'
      `);

    // Get invoice statistics
    const invoiceStatsResult = await pool
      .request()
      .input("firstDayOfMonth", firstDayOfMonth)
      .input("firstDayOfLastMonth", firstDayOfLastMonth)
      .input("lastDayOfLastMonth", lastDayOfLastMonth).query(`
        SELECT
          COUNT(*) as total,
          ISNULL(SUM(amount_total), 0) as totalRevenue,
          ISNULL(SUM(CASE WHEN paid_time >= @firstDayOfMonth THEN amount_total ELSE 0 END), 0) as thisMonthRevenue,
          ISNULL(SUM(CASE WHEN paid_time >= @firstDayOfLastMonth AND paid_time <= @lastDayOfLastMonth THEN amount_total ELSE 0 END), 0) as lastMonthRevenue,
          ISNULL(AVG(amount_total), 0) as averageAmount
        FROM invoices
        WHERE payment_status = 'paid'
      `);

    // Get plan statistics
    const planStatsResult = await pool.request().query(`
      SELECT
        COUNT(*) as totalPlans,
        SUM(CASE WHEN ps.sessions_id IS NOT NULL THEN 1 ELSE 0 END) as sessionPlans,
        SUM(CASE WHEN pm.mentorships_id IS NOT NULL THEN 1 ELSE 0 END) as mentorshipPlans
      FROM plans p
      LEFT JOIN plan_sessions ps ON p.plan_id = ps.sessions_id
      LEFT JOIN plan_mentorships pm ON p.plan_id = pm.mentorships_id
    `);

    // Get meeting statistics
    const meetingStatsResult = await pool.request().query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('Pending', 'Scheduled') AND start_time > GETDATE() THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM meetings
    `);

    const stats: SystemStats = {
      users: {
        total: userStatsResult.recordset[0].total,
        mentors: userStatsResult.recordset[0].mentors,
        mentees: userStatsResult.recordset[0].mentees,
        admins: userStatsResult.recordset[0].admins,
      },
      mentors: {
        active: mentorStatsResult.recordset[0].active || 0,
        pending: mentorStatsResult.recordset[0].pending || 0,
        inactive: mentorStatsResult.recordset[0].inactive || 0,
        banned: mentorStatsResult.recordset[0].banned || 0,
      },
      mentees: {
        active: menteeStatsResult.recordset[0].active || 0,
        inactive: menteeStatsResult.recordset[0].inactive || 0,
        banned: menteeStatsResult.recordset[0].banned || 0,
      },
      bookings: {
        total: bookingStatsResult.recordset[0].total,
        thisMonth: bookingStatsResult.recordset[0].thisMonth,
        lastMonth: bookingStatsResult.recordset[0].lastMonth,
      },
      invoices: {
        total: invoiceStatsResult.recordset[0].total,
        totalRevenue: parseFloat(invoiceStatsResult.recordset[0].totalRevenue),
        thisMonthRevenue: parseFloat(invoiceStatsResult.recordset[0].thisMonthRevenue),
        lastMonthRevenue: parseFloat(invoiceStatsResult.recordset[0].lastMonthRevenue),
        averageInvoiceAmount: parseFloat(invoiceStatsResult.recordset[0].averageAmount),
      },
      plans: {
        totalPlans: planStatsResult.recordset[0].totalPlans,
        sessionPlans: planStatsResult.recordset[0].sessionPlans,
        mentorshipPlans: planStatsResult.recordset[0].mentorshipPlans,
      },
      meetings: {
        total: meetingStatsResult.recordset[0].total,
        completed: meetingStatsResult.recordset[0].completed || 0,
        upcoming: meetingStatsResult.recordset[0].upcoming || 0,
        cancelled: meetingStatsResult.recordset[0].cancelled || 0,
      },
    };

    return {
      success: true,
      message: "System statistics retrieved successfully",
      data: stats,
    };
  } catch (error) {
    console.error("Error in getSystemStatsService:", error);
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
  getSystemStatsService,
};
