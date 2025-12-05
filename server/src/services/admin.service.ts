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

const listMenteesService = async (): Promise<AdminListResponse<AdminMenteeItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const result = await pool.request().query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, m.goal
    FROM users u
    JOIN mentees m ON u.user_id = m.user_id
  `);

  return {
    success: true,
    message: "Mentees retrieved successfully",
    data: result.recordset,
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

const listMentorsService = async (): Promise<AdminListResponse<AdminMentorItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const result = await pool.request().query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role,
           m.bio, m.cv_url, m.headline, m.response_time
    FROM users u
    JOIN mentors m ON u.user_id = m.user_id
  `);

  return {
    success: true,
    message: "Mentors retrieved successfully",
    data: result.recordset,
  };
};

const getPendingMentorsService = async (): Promise<AdminListResponse<AdminMentorItem>> => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  const result = await pool.request().input("status", Status.Pending).query(`
    SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role, u.created_at,
           m.bio, m.cv_url, m.headline, m.response_time
    FROM users u
    JOIN mentors m ON u.user_id = m.user_id
    WHERE u.status = @status
    ORDER BY u.created_at DESC
  `);

  return {
    success: true,
    message: "Pending mentors retrieved successfully",
    data: result.recordset,
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
};
