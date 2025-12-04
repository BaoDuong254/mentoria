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
    if (data.first_name || data.last_name || data.email) {
      await transaction
        .request()
        .input("userId", userId)
        .input("firstName", data.first_name || null)
        .input("lastName", data.last_name || null)
        .input("email", data.email || null).query(`
          UPDATE users
          SET
            first_name = COALESCE(@firstName, first_name),
            last_name = COALESCE(@lastName, last_name),
            email = COALESCE(@email, email),
            updated_at = GETDATE()
          WHERE user_id = @userId
        `);
    }

    if (typeof data.goal !== "undefined") {
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
    if (data.first_name || data.last_name || data.email) {
      await transaction
        .request()
        .input("userId", userId)
        .input("firstName", data.first_name || null)
        .input("lastName", data.last_name || null)
        .input("email", data.email || null).query(`
          UPDATE users
          SET
            first_name = COALESCE(@firstName, first_name),
            last_name = COALESCE(@lastName, last_name),
            email = COALESCE(@email, email),
            updated_at = GETDATE()
          WHERE user_id = @userId
        `);
    }

    await transaction
      .request()
      .input("userId", userId)
      .input("bio", data.bio || null)
      .input("headline", data.headline || null)
      .input("responseTime", data.response_time || null)
      .input("cvUrl", data.cv_url || null).query(`
        UPDATE mentors
        SET
          bio = COALESCE(@bio, bio),
          headline = COALESCE(@headline, headline),
          response_time = COALESCE(@responseTime, response_time),
          cv_url = COALESCE(@cvUrl, cv_url)
        WHERE user_id = @userId
      `);

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

  if (action === "accept") {
    await pool
      .request()
      .input("userId", userId)
      .input("status", Status.Inactive)
      .query(`UPDATE users SET status = @status, updated_at = GETDATE() WHERE user_id = @userId`);

    return {
      success: true,
      message: "Mentor accepted successfully",
      data: mentor,
    };
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
