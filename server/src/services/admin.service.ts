import poolPromise from "@/config/database";
import { Status } from "@/constants/type";

const listMentees = async () => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const result = await pool
    .request()
    .query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, m.goal FROM users u JOIN mentees m ON u.user_id = m.user_id`
    );
  return result.recordset;
};

const getMentee = async (userId: number) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const result = await pool
    .request()
    .input("userId", userId)
    .query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, m.goal FROM users u JOIN mentees m ON u.user_id = m.user_id WHERE u.user_id = @userId`
    );
  return result.recordset[0];
};

const updateMentee = async (userId: number, data: any) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
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
    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteMentee = async (userId: number) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Check if mentee exists
  const mentee = await getMentee(userId);
  if (!mentee) return { success: false, message: "Mentee not found" };

  // Delete from users table (CASCADE will handle mentees table)
  const result = await pool.request().input("userId", userId).query(`DELETE FROM users WHERE user_id = @userId`);

  if (result.rowsAffected[0] === 0) {
    return { success: false, message: "Failed to delete mentee" };
  }

  return { success: true };
};

// Mentors
const listMentors = async () => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const result = await pool
    .request()
    .query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role, m.bio, m.cv_url, m.headline, m.response_time FROM users u JOIN mentors m ON u.user_id = m.user_id`
    );
  return result.recordset;
};

const getPendingMentors = async () => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const result = await pool
    .request()
    .input("status", Status.Pending)
    .query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role, u.created_at, m.bio, m.cv_url, m.headline, m.response_time 
     FROM users u 
     JOIN mentors m ON u.user_id = m.user_id 
     WHERE u.status = @status
     ORDER BY u.created_at DESC`
    );
  return result.recordset;
};

const getMentor = async (userId: number) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const result = await pool
    .request()
    .input("userId", userId)
    .query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email, u.status, u.role, m.bio, m.cv_url, m.headline, m.response_time FROM users u JOIN mentors m ON u.user_id = m.user_id WHERE u.user_id = @userId`
    );
  return result.recordset[0];
};

const updateMentor = async (userId: number, data: any) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
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

    // update mentors specific columns
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
    return { success: true };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const deleteMentor = async (userId: number) => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");

  // Check if mentor exists
  const mentor = await getMentor(userId);
  if (!mentor) return { success: false, message: "Mentor not found" };

  // Delete from users table (CASCADE will handle mentors table)
  const result = await pool.request().input("userId", userId).query(`DELETE FROM users WHERE user_id = @userId`);

  if (result.rowsAffected[0] === 0) {
    return { success: false, message: "Failed to delete mentor" };
  }

  return { success: true };
};

// Approve or reject mentor profile
const reviewMentor = async (userId: number, action: "accept" | "reject") => {
  const pool = await poolPromise;
  if (!pool) throw new Error("Database connection not established");
  const mentor = await getMentor(userId);
  if (!mentor) return { success: false, message: "Mentor not found" };

  if (action === "accept") {
    // According to requirement, set status to Inactive and notify
    await pool
      .request()
      .input("userId", userId)
      .input("status", Status.Inactive)
      .query(`UPDATE users SET status = @status, updated_at = GETDATE() WHERE user_id = @userId`);
    return { success: true, mentor };
  }

  // reject: delete the user (cascade deletes mentor record)
  if (action === "reject") {
    const mentorCopy = mentor;
    await pool.request().input("userId", userId).query(`DELETE FROM users WHERE user_id = @userId`);
    return { success: true, mentor: mentorCopy };
  }

  return { success: false, message: "Invalid action" };
};

export {
  listMentees,
  getMentee,
  updateMentee,
  deleteMentee,
  listMentors,
  getPendingMentors,
  getMentor,
  updateMentor,
  deleteMentor,
  reviewMentor,
};
